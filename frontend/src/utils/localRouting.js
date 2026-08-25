import { STATIC_STATIONS, connections, LINES_STATIONS } from './metroData.js';

// Build adjacency list
const graph = {};
STATIC_STATIONS.forEach(s => {
  graph[s._id] = [];
});
connections.forEach(c => {
  if (graph[c.from] && graph[c.to]) {
    graph[c.from].push({ node: c.to, weight: c.dist, dur: c.dur, line: c.line });
    graph[c.to].push({ node: c.from, weight: c.dist, dur: c.dur, line: c.line });
  }
});

// Calculate Fare Based on Standard Brackets
function calculateFare(distance) {
  if (distance <= 2) return 10;
  if (distance <= 5) return 20;
  if (distance <= 12) return 30;
  if (distance <= 21) return 40;
  if (distance <= 32) return 50;
  return 60;
}

// Client-Side Dijkstra Router Fallback
export function calculateLocalRoute(startId, endId) {
  const distances = {};
  const durations = {};
  const previous = {};
  const queue = new Set();
  const edgeUsed = {};

  STATIC_STATIONS.forEach(s => {
    distances[s._id] = Infinity;
    durations[s._id] = Infinity;
    previous[s._id] = null;
    edgeUsed[s._id] = null;
    queue.add(s._id);
  });

  distances[startId] = 0;
  durations[startId] = 0;

  while (queue.size > 0) {
    let minNode = null;
    let minDist = Infinity;
    queue.forEach(node => {
      if (distances[node] < minDist) {
        minDist = distances[node];
        minNode = node;
      }
    });

    if (minNode === null || minNode === endId) break;

    queue.delete(minNode);

    const neighbors = graph[minNode] || [];
    neighbors.forEach(neighbor => {
      if (queue.has(neighbor.node)) {
        const altDist = distances[minNode] + neighbor.weight;
        if (altDist < distances[neighbor.node]) {
          distances[neighbor.node] = altDist;
          durations[neighbor.node] = durations[minNode] + neighbor.dur;
          previous[neighbor.node] = minNode;
          edgeUsed[neighbor.node] = neighbor; // store edge details
        }
      }
    });
  }

  // Construct path
  const pathIds = [];
  let u = endId;
  while (u !== null) {
    pathIds.unshift(u);
    u = previous[u];
  }

  if (distances[endId] === Infinity) {
    return { success: false, message: 'No route found between selected stations.' };
  }

  const pathStations = pathIds.map(id => STATIC_STATIONS.find(s => s._id === id));
  
  // Calculate Interchanges
  const interchanges = [];
  let currentLine = null;
  const segments = [];
  
  for (let i = 1; i < pathIds.length; i++) {
    const toNode = pathIds[i];
    const edge = edgeUsed[toNode];
    if (edge) {
      segments.push(edge);
      if (currentLine && currentLine !== edge.line) {
        interchanges.push({
          station: pathStations[i - 1],
          fromLine: currentLine,
          toLine: edge.line
        });
      }
      currentLine = edge.line;
    }
  }

  // Calculate Train Direction towards Terminal Station
  let trainDirection = '';
  if (segments.length > 0) {
    const lastSeg = segments[segments.length - 1];
    const lineStations = LINES_STATIONS[lastSeg.line];
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

  const totalDistance = parseFloat(distances[endId].toFixed(2));
  const totalDuration = durations[endId];

  return {
    success: true,
    route: {
      distance: totalDistance,
      duration: totalDuration,
      stationCount: pathStations.length,
      interchangeCount: interchanges.length,
      interchanges,
      trainDirection
    },
    fare: calculateFare(totalDistance),
    path: pathStations
  };
}

export { STATIC_STATIONS };
