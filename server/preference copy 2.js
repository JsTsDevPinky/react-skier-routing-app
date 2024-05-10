function findShortestRoute(start, end, graph, routes) {
  // Initialize distances with infinity except for the start point
  const distances = {};
  Object.keys(graph).forEach((point) => {
    distances[point] = point === start ? 0 : Infinity;
  });

  // Initialize visited set
  const visited = new Set();

  // Keep track of the used routes
  const usedRoutes = {};

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
        const distanceToNeighbor = shortestDistance + routeInfo.length; // Update distance using route length
        if (distanceToNeighbor < distances[neighbor]) {
          distances[neighbor] = distanceToNeighbor;
          // Record the shortest route between each pair of consecutive points
          usedRoutes[`${closestPoint}-${neighbor}`] = routeInfo;
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

  // Initialize shortestRoutes array to store the shortest routes between each pair of consecutive points
  const shortestRoutes = shortestPath
    .slice(0, -1)
    .map((point, index) => usedRoutes[`${point}-${shortestPath[index + 1]}`]);

  console.log("--------", shortestRoutes);
  return {
    resultPath: shortestPath,
    resultRoute: shortestRoutes.filter((route) => route !== undefined),
  };
}

// Function to find the easiest route between two points using Dijkstra's algorithm
function findEasiestRoute(start, end, graph, routes) {
  // Initialize distances with infinity except for the start point
  const distances = {};
  Object.keys(graph).forEach((point) => {
    distances[point] = point === start ? 0 : Infinity;
  });
  console.log("1");
  // Initialize visited set
  const visited = new Set();

  // Keep track of the used routes
  const usedRoutes = {};

  // Dijkstra's algorithm
  while (true) {
    let closestPoint = null;
    let easiestDistance = Infinity;
    console.log("2");
    // Find the closest unvisited point
    Object.keys(distances).forEach((point) => {
      if (!visited.has(point) && distances[point] < easiestDistance) {
        closestPoint = point;
        easiestDistance = distances[point];
      }
      console.log("3");
    });

    // If there are no more unvisited points or the end point is reached, break
    if (!closestPoint || closestPoint === end) break;

    // Update distances to its neighbors
    const neighbors = graph[closestPoint];
    for (const neighbor in neighbors) {
      const neighborRoutes = neighbors[neighbor];
      neighborRoutes.forEach((routeId) => {
        const routeInfo = routes.find((r) => r.id === routeId);
        const distanceToNeighbor =
          easiestDistance + calculateRouteWeight(routeInfo);
        if (distanceToNeighbor < distances[neighbor]) {
          distances[neighbor] = distanceToNeighbor;
          // Record the easiest route between each pair of consecutive points
          usedRoutes[`${closestPoint}-${neighbor}`] = routeInfo;
        }
        console.log("4");
      });
    }

    // Mark the closest point as visited
    visited.add(closestPoint);
  }

  // Backtrack to find the easiest path
  const easiestPath = [end];
  let previousPoint = end;
  while (previousPoint !== start) {
    const neighbors = graph[previousPoint];
    let minDistance = Infinity;
    let nextPoint = null;
    for (const neighbor in neighbors) {
      const neighborRoutes = neighbors[neighbor];
      neighborRoutes.forEach((routeId) => {
        const routeInfo = routes.find((r) => r.id === routeId);
        const distanceToNeighbor = distances[neighbor];
        const expectedDistance =
          distances[previousPoint] - calculateRouteWeight(routeInfo);
        if (
          distanceToNeighbor === expectedDistance &&
          expectedDistance < minDistance
        ) {
          minDistance = expectedDistance;
          nextPoint = neighbor;
        }
        // console.log("5");
      });
    }
    if (nextPoint !== null) {
      easiestPath.unshift(nextPoint);
      previousPoint = nextPoint;
    } else {
      // If no valid next point found, break the loop
      break;
    }
  }

  // Initialize easiestRoutes array to store the easiest routes between each pair of consecutive points
  const easiestRoutes = easiestPath
    .slice(0, -1)
    .map((point, index) => usedRoutes[`${point}-${easiestPath[index + 1]}`])
    .filter((route) => route !== undefined);

  console.log("--------", easiestRoutes);
  return { resultPath: easiestPath, resultRoute: easiestRoutes };
}

// Function to calculate the weight of a route based on the given rule
function calculateRouteWeight(route) {
  switch (route.level) {
    case "easy":
      return route.length;
    case "medium":
      return route.length * 1.5;
    case "hard":
      return route.length * 2;
    default:
      return route.length;
  }
}

// Function to find the shortest route between two points using Dijkstra's algorithm
function findFastestRoute(start, end, graph, routes) {
  // Pre-calculate route times
  const routeTimes = {};
  routes.forEach((route) => {
    routeTimes[route.id] = calculateRouteTime(route);
  });

  // Initialize distances with infinity except for the start point
  const distances = {};
  Object.keys(graph).forEach((point) => {
    distances[point] = point === start ? 0 : Infinity;
  });

  // Initialize visited set
  const visited = new Set();

  // Keep track of the used routes
  const usedRoutes = {};

  // Dijkstra's algorithm
  while (true) {
    let closestPoint = null;
    let shortestTime = Infinity;

    // Find the closest unvisited point
    Object.keys(distances).forEach((point) => {
      if (!visited.has(point) && distances[point] < shortestTime) {
        closestPoint = point;
        shortestTime = distances[point];
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
        const timeToNeighbor = shortestTime + routeTimes[routeId];
        if (timeToNeighbor < distances[neighbor]) {
          distances[neighbor] = timeToNeighbor;
          // Record the shortest route between each pair of consecutive points
          usedRoutes[neighbor] = {
            from: closestPoint,
            routeId: routeId,
          };
        }
      });
    }
  }

  // Backtrack to find the shortest path
  const shortestPath = [end];
  let previousPoint = end;
  while (previousPoint !== start) {
    const { from, routeId } = usedRoutes[previousPoint];
    shortestPath.unshift(from);
    previousPoint = from;
  }

  // Generate the shortest routes array
  const shortestRoutes = shortestPath.slice(0, -1).map((point, index) => {
    const nextPoint = shortestPath[index + 1];
    return routes.find((route) => route.id === usedRoutes[nextPoint].routeId);
  });

  console.log("--------", shortestRoutes);
  return { resultPath: shortestPath, resultRoute: shortestRoutes };
}

// Function to calculate the time to traverse a route based on the given criteria
function calculateRouteTime(route) {
  console.log("5");
  if ((route.level = "lift")) {
    switch (route.type) {
      case "chairlift":
        return 7; // 7 minutes
      case "T-bar":
        return 5; // 5 minutes
      case "gondola":
        return 10; // 10 minutes
      default:
        return 0;
    }
  } else {
    return route.length / 50000 / 60; // time = distance / speed
  }
}

// Function to find the route with minimum lift usage between two points
function findMinimumLiftUsageRoute(start, end, graph, routes) {
  // Initialize distances with infinity except for the start point
  const distances = {};
  Object.keys(graph).forEach((point) => {
    distances[point] = point === start ? 0 : Infinity;
  });

  // Initialize visited set
  const visited = new Set();

  // Keep track of the used routes
  const usedRoutes = {};

  // Dijkstra's algorithm
  while (true) {
    let closestPoint = null;
    let minLiftUsage = Infinity;

    // Find the closest unvisited point
    Object.keys(distances).forEach((point) => {
      if (!visited.has(point) && distances[point] < minLiftUsage) {
        closestPoint = point;
        minLiftUsage = distances[point];
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
        const liftUsageToNeighbor =
          minLiftUsage + calculateLiftUsage(routeInfo);
        if (liftUsageToNeighbor < distances[neighbor]) {
          distances[neighbor] = liftUsageToNeighbor;
          // Record the route with minimum lift usage between each pair of consecutive points
          usedRoutes[neighbor] = {
            from: closestPoint,
            routeId: routeId,
          };
        }
      });
    }
  }

  // Backtrack to find the path with minimum lift usage
  const pathWithMinLiftUsage = [end];
  let previousPoint = end;
  while (previousPoint !== start) {
    const { from, routeId } = usedRoutes[previousPoint];
    pathWithMinLiftUsage.unshift(from);
    previousPoint = from;
  }

  // Generate the routes array for the path with minimum lift usage
  const routesWithMinLiftUsage = pathWithMinLiftUsage
    .slice(0, -1)
    .map((point, index) => {
      const nextPoint = pathWithMinLiftUsage[index + 1];
      return routes.find((route) => route.id === usedRoutes[nextPoint].routeId);
    });

  console.log("--------", routesWithMinLiftUsage);
  return {
    resultPath: pathWithMinLiftUsage,
    resultRoute: routesWithMinLiftUsage,
  };
}

// Function to calculate the lift usage of a route based on the given rule
function calculateLiftUsage(route) {
  if (route.level === "lift") {
    return 1; // One lift used
  } else {
    return 0; // No lift used
  }
}

module.exports = {
  findShortestRoute: findShortestRoute,
  findEasiestRoute: findEasiestRoute,
  findFastestRoute: findFastestRoute,
  findMinimumLiftUsageRoute: findMinimumLiftUsageRoute,
};
