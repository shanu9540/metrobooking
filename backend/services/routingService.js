const Station = require('../models/Station');
const Route = require('../models/Route');

/**
 * Rebuilds the graph from the DB and finds the shortest path between two stations.
 * Uses Dijkstra's algorithm.
 */
async function findRoute(sourceId, destinationId) {
  // 1. Fetch active stations
  const stations = await Station.find({ isActive: true });
  const stationMap = {};
  stations.forEach(s => {
    stationMap[s._id.toString()] = s;
  });

  const srcStation = stations.find(s => s._id.toString() === sourceId || s.stationId === sourceId);
  const destStation = stations.find(s => s._id.toString() === destinationId || s.stationId === destinationId);

  if (!srcStation || !destStation) {
    throw new Error('Source or Destination station not found');
  }

  const srcKey = srcStation._id.toString();
  const destKey = destStation._id.toString();

  // 2. Fetch active connections
  const routes = await Route.find({ isActive: true });

  // 3. Build adjacency list (Graph)
  // Each node connects to neighbors. Since routes are bidirectional, we add both ways.
  const graph = {};
  stations.forEach(s => {
    graph[s._id.toString()] = [];
  });

  routes.forEach(r => {
    const fromKey = r.fromStation.toString();
    const toKey = r.toStation.toString();
    
    if (graph[fromKey] && graph[toKey]) {
      graph[fromKey].push({
        to: toKey,
        distance: r.distance,
        duration: r.duration,
        lineName: r.lineName
      });
      graph[toKey].push({
        to: fromKey,
        distance: r.distance,
        duration: r.duration,
        lineName: r.lineName
      });
    }
  });

  // 4. Dijkstra's Algorithm
  const distances = {};
  const previous = {};
  const edgeUsed = {}; // to track line used for each node transition
  const unvisited = new Set();

  stations.forEach(s => {
    const key = s._id.toString();
    distances[key] = Infinity;
    previous[key] = null;
    edgeUsed[key] = null;
    unvisited.add(key);
  });

  distances[srcKey] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentKey = null;
    let minDistance = Infinity;

    for (const key of unvisited) {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        currentKey = key;
      }
    }

    // If minimum distance is Infinity, the remaining nodes are unreachable
    if (currentKey === null || minDistance === Infinity) {
      break;
    }

    if (currentKey === destKey) {
      break; // Found shortest path to destination
    }

    unvisited.delete(currentKey);

    // Update distances to neighbors
    const neighbors = graph[currentKey] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = distances[currentKey] + neighbor.distance;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = currentKey;
        edgeUsed[neighbor.to] = neighbor; // Store full edge info (lineName, duration, distance)
      }
    }
  }

  if (distances[destKey] === Infinity) {
    throw new Error('No route exists between the selected stations');
  }

  // 5. Reconstruct Path
  const pathKeys = [];
  let current = destKey;
  while (current !== null) {
    pathKeys.unshift(current);
    current = previous[current];
  }

  // 6. Build route response details
  const pathStations = pathKeys.map(key => stationMap[key]);
  let totalDistance = 0;
  let totalDuration = 0;
  const interchanges = [];
  const routeSegments = [];

  for (let i = 0; i < pathKeys.length - 1; i++) {
    const fromNode = pathKeys[i];
    const toNode = pathKeys[i + 1];
    
    // Find connection details
    const edge = edgeUsed[toNode];
    if (edge) {
      totalDistance += edge.distance;
      totalDuration += edge.duration;
      routeSegments.push({
        from: stationMap[fromNode],
        to: stationMap[toNode],
        lineName: edge.lineName,
        distance: edge.distance,
        duration: edge.duration
      });
    }
  }

  // Calculate interchanges:
  // We scan the path and find where the line changes.
  let currentLine = null;
  for (let i = 0; i < routeSegments.length; i++) {
    const seg = routeSegments[i];
    if (currentLine !== null && seg.lineName !== currentLine) {
      interchanges.push({
        station: stationMap[seg.from._id.toString()],
        fromLine: currentLine,
        toLine: seg.lineName
      });
    }
    currentLine = seg.lineName;
  }

  // Calculate Train Direction towards Terminal Station
  const { LINES_STATIONS } = require('../config/metroData');
  let trainDirection = '';
  if (routeSegments.length > 0) {
    const lastSeg = routeSegments[routeSegments.length - 1];
    const lineStations = LINES_STATIONS[lastSeg.lineName];
    if (lineStations && pathStations.length >= 2) {
      const lastSt = pathStations[pathStations.length - 1].stationName;
      const prevSt = pathStations[pathStations.length - 2].stationName;
      const idxLast = lineStations.indexOf(lastSt);
      const idxPrev = lineStations.indexOf(prevSt);
      if (idxLast !== -1 && idxPrev !== -1) {
        trainDirection = idxLast > idxPrev ? lineStations[lineStations.length - 1] : lineStations[0];
      }
    }
  }

  return {
    path: pathStations,
    segments: routeSegments,
    distance: Math.round(totalDistance * 100) / 100, // round to 2 decimal places
    duration: Math.round(totalDuration), // round to nearest minute
    stationCount: pathStations.length,
    interchangeCount: interchanges.length,
    interchanges,
    trainDirection
  };
}

module.exports = {
  findRoute
};
