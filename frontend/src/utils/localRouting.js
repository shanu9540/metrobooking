// Local Static Stations (Includes Noida Sector 18 and Noida City Centre)
export const STATIC_STATIONS = [
  { _id: 'HCC', stationId: 'HCC', stationName: 'Millennium City Centre Gurugram', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.0725, 28.4593] }, address: 'Sector 29, Gurugram, Haryana' },
  { _id: 'AIIMS', stationId: 'AIIMS', stationName: 'AIIMS', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2072, 28.5686] }, address: 'Ansari Nagar, New Delhi' },
  { _id: 'CS', stationId: 'CS', stationName: 'Central Secretariat', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2114, 28.6148] }, address: 'Rafi Marg, New Delhi' },
  { _id: 'RC', stationId: 'RC', stationName: 'Rajiv Chowk', lineName: ['Yellow', 'Blue'], location: { type: 'Point', coordinates: [77.2197, 28.6328] }, address: 'Connaught Place, New Delhi' },
  { _id: 'ND', stationId: 'ND', stationName: 'New Delhi', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2223, 28.6431] }, address: 'Bhavabhuti Marg, New Delhi' },
  { _id: 'CC', stationId: 'CC', stationName: 'Chandni Chowk', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2302, 28.6578] }, address: 'Chandni Chowk, Old Delhi' },
  { _id: 'KG', stationId: 'KG', stationName: 'Kashmere Gate', lineName: ['Yellow', 'Red'], location: { type: 'Point', coordinates: [77.2284, 28.6675] }, address: 'Lothian Road, Kashmere Gate, Delhi' },
  { _id: 'DW21', stationId: 'DW21', stationName: 'Dwarka Sector 21', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.0583, 28.5523] }, address: 'Sector 21, Dwarka, New Delhi' },
  { _id: 'RG', stationId: 'RG', stationName: 'Rajouri Garden', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.1215, 28.6489] }, address: 'Rajouri Garden, New Delhi' },
  { _id: 'MH', stationId: 'MH', stationName: 'Mandi House', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.2339, 28.6256] }, address: 'Mandi House, New Delhi' },
  { _id: 'YB', stationId: 'YB', stationName: 'Yamuna Bank', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.2625, 28.6212] }, address: 'Vikas Marg, Yamuna Bank, Delhi' },
  { _id: 'NEC', stationId: 'NEC', stationName: 'Noida Electronic City', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3730, 28.6288] }, address: 'Sector 62, Noida, Uttar Pradesh' },
  { _id: 'DL', stationId: 'DL', stationName: 'Dilshad Garden', lineName: ['Red'], location: { type: 'Point', coordinates: [77.3218, 28.6758] }, address: 'Dilshad Garden, Delhi' },
  { _id: 'SEC18', stationId: 'SEC18', stationName: 'Noida Sector 18', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3259, 28.5708] }, address: 'Sector 18, Noida, Uttar Pradesh' },
  { _id: 'NCC', stationId: 'NCC', stationName: 'Noida City Centre', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3409, 28.5747] }, address: 'Sector 39, Noida, Uttar Pradesh' },
  { _id: 'SEC34', stationId: 'SEC34', stationName: 'Noida Sector 34', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3499, 28.5796] }, address: 'Sector 34, Noida, Uttar Pradesh' },
  { _id: 'SEC52', stationId: 'SEC52', stationName: 'Noida Sector 52', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3621, 28.5831] }, address: 'Sector 52, Noida, Uttar Pradesh' }
];

// Connections Map (Undirected Graph)
const connections = [
  { from: 'HCC', to: 'AIIMS', line: 'Yellow', dist: 13.5, dur: 20 },
  { from: 'AIIMS', to: 'CS', line: 'Yellow', dist: 5.5, dur: 9 },
  { from: 'CS', to: 'RC', line: 'Yellow', dist: 2.1, dur: 4 },
  { from: 'RC', to: 'ND', line: 'Yellow', dist: 1.1, dur: 2 },
  { from: 'ND', to: 'CC', line: 'Yellow', dist: 1.6, dur: 3 },
  { from: 'CC', to: 'KG', line: 'Yellow', dist: 1.2, dur: 2 },
  { from: 'DW21', to: 'RG', line: 'Blue', dist: 12.5, dur: 18 },
  { from: 'RG', to: 'RC', line: 'Blue', dist: 8.2, dur: 12 },
  { from: 'RC', to: 'MH', line: 'Blue', dist: 1.5, dur: 3 },
  { from: 'MH', to: 'YB', line: 'Blue', dist: 2.8, dur: 5 },
  { from: 'YB', to: 'SEC18', line: 'Blue', dist: 9.2, dur: 13 },
  { from: 'SEC18', to: 'NCC', line: 'Blue', dist: 2.0, dur: 3 },
  { from: 'NCC', to: 'SEC34', line: 'Blue', dist: 1.5, dur: 2 },
  { from: 'SEC34', to: 'SEC52', line: 'Blue', dist: 1.2, dur: 2 },
  { from: 'SEC52', to: 'NEC', line: 'Blue', dist: 3.5, dur: 5 },
  { from: 'KG', to: 'DL', line: 'Red', dist: 9.5, dur: 14 }
];

// Build adjacency list
const graph = {};
STATIC_STATIONS.forEach(s => {
  graph[s._id] = [];
});
connections.forEach(c => {
  graph[c.from].push({ node: c.to, weight: c.dist, dur: c.dur, line: c.line });
  graph[c.to].push({ node: c.from, weight: c.dist, dur: c.dur, line: c.line });
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
  const linesUsed = {};
  const previous = {};
  const queue = new Set();

  STATIC_STATIONS.forEach(s => {
    distances[s._id] = Infinity;
    durations[s._id] = Infinity;
    linesUsed[s._id] = null;
    previous[s._id] = null;
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
          linesUsed[neighbor.node] = neighbor.line;
          previous[neighbor.node] = minNode;
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
  for (let i = 1; i < pathStations.length; i++) {
    const fromSt = pathStations[i - 1];
    const toSt = pathStations[i];
    const edge = graph[fromSt._id].find(n => n.node === toSt._id);
    if (edge) {
      if (currentLine && currentLine !== edge.line) {
        interchanges.push({
          stationName: fromSt.stationName,
          fromLine: currentLine,
          changeToLine: edge.line
        });
      }
      currentLine = edge.line;
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
      interchanges: interchanges.map(ic => ({
        station: { stationName: ic.stationName },
        fromLine: ic.fromLine,
        toLine: ic.changeToLine
      }))
    },
    fare: calculateFare(totalDistance),
    path: pathStations
  };
}
