// Function to find the shortest route between two points using Dijkstra's algorithm
function findShortestRoute(start, end, graph, routes) {
  // Initialize distances with infinity except for the start point
  const distances = {};
  Object.keys(graph).forEach((point) => {
    distances[point] = point === start ? 0 : Infinity;
  });

  // Initialize visited set
  const visited = new Set();

  // Keep track of the used routes
  const usedRoutes = [];

  // Dijkstra's algorithm
  while (true) {
    let closestPoint = null;
    let shortestDistance = Infinity;

    // Find the closest unvisited point
    Object.keys(distances).forEach((point) => {
      if (!visited.has(point) && distances[point] < shortestDistance) {
        closestPoint = point;
        shortestDistance = distances[point];
      }
    });

    // If there are no more unvisited points or the end point is reached, break
    if (!closestPoint || closestPoint === end) break;

    // Mark the closest point as visited
    visited.add(closestPoint);

    // Update distances to its neighbors
    const neighbors = graph[closestPoint];
    for (const neighbor in neighbors) {
      const neighborRoutes = neighbors[neighbor];
      neighborRoutes.forEach((routeId) => {
        const routeInfo = routes.find((r) => r.id === routeId);
        const distanceToNeighbor = shortestDistance + routeInfo.length;
        if (distanceToNeighbor < distances[neighbor]) {
          distances[neighbor] = distanceToNeighbor;
        }
      });
    }
  }

  // Backtrack to find the shortest path
  const shortestPath = [end];
  let previousPoint = end;
  while (previousPoint !== start) {
    const neighbors = graph[previousPoint];
    for (const neighbor in neighbors) {
      const neighborRoutes = neighbors[neighbor];
      neighborRoutes.forEach((routeId) => {
        const routeInfo = routes.find((r) => r.id === routeId);
        const distanceToNeighbor = distances[neighbor];
        if (
          distanceToNeighbor ===
          distances[previousPoint] - routeInfo.length
        ) {
          shortestPath.unshift(neighbor);
          previousPoint = neighbor;
        }
      });
    }
  }

  console.log("--------", usedRoutes);
  return { resultPath: shortestPath, resultRoute: usedRoutes };
}

module.exports = {
  findShortestRoute: findShortestRoute,
};
