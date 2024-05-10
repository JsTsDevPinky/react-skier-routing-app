const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { routes, graph, points } = require("./routes");
const {
  findShortestRoute,
  findEasiestRoute,
  findFastestRoute,
  findMinimumLiftUsageRoute,
} = require("./preference");

let resultPath = [],
  resultRoute = [];

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "false" }));

const port = process.env.SERVER_PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  //
  app.get("*", (req, res) => {
    res.sendfile(path.join((__dirname = "client/build/index.html")));
  });
}

function isEqual(a, b) {
  if (Array.isArray(a)) return a.every((each, index) => each === b[index]);
  else return a === b;
}

function isInclude(a, b) {
  return a.some((each) => isEqual(each, b));
}

function findById(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i].id === b) return a[i];
  }
  return null;
}

async function findAllRoutes(
  start,
  end,
  difficulty,
  routeId,
  resultPath = [],
  resultRoute = [],
  visited = new Set(),
  path = [],
  routeIdArr = []
) {
  visited.add(start);
  path.push(start);
  routeIdArr.push(routeId);
  if (start === end) {
    if (!isInclude(resultPath, path)) {
      resultPath.push(path);
      console.log(`Route: ${path.join(" -> ")}`);
      // Add route data to resultRoute array
      const routeData = [];
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const routesBetweenPoints = graph[from][to];
        for (const routeId of routesBetweenPoints) {
          const routeInfo = routes.find((r) => r.id === routeId);
          routeData.push(routeInfo);
        }
      }
      resultRoute.push(routeData);
    }
  } else {
    for (const neighbor in graph[start]) {
      if (!visited.has(neighbor)) {
        for (const route_id of graph[start][neighbor]) {
          if (
            difficulty.length > 0 &&
            findById(routes, route_id).level !== "lift" &&
            !isInclude(difficulty, findById(routes, route_id).level)
          ) {
            console.log(
              findById(routes, route_id).level,
              difficulty,
              findById(routes, route_id).level
            );
            continue;
          } else {
            const [updatedResultPath, updatedResultRoute] = await findAllRoutes(
              neighbor,
              end,
              difficulty,
              route_id,
              resultPath,
              resultRoute,
              new Set(visited),
              [...path],
              [...routeIdArr]
            );
            resultPath = updatedResultPath;
            resultRoute = updatedResultRoute;
          }
        }
      }
    }
  }
  return [resultPath, resultRoute];
}

app.get("/api/test", (req, res) => {
  return res.send("Success");
});

app.post("/api/calculateRoute", async (req, res) => {
  let preferencePath = [],
    preferenceRoute = [],
    resultPath = [],
    resultRoute = [];

  console.log(req.body, resultRoute, resultPath);

  switch (req.body.preference) {
    case "shortest": {
      const tmp = findShortestRoute(
        req.body.startLocation,
        req.body.endLocation,
        graph,
        routes
      );
      preferencePath = [tmp.resultPath];
      preferenceRoute = tmp.resultRoute;
      break;
    }
    case "easiest": {
      const tmp = findEasiestRoute(
        req.body.startLocation,
        req.body.endLocation,
        graph,
        routes
      );
      preferencePath = [tmp.resultPath];
      preferenceRoute = tmp.resultRoute;
      break;
    }
    case "fastest": {
      console.log("fastest-----------");
      const tmp = findFastestRoute(
        req.body.startLocation,
        req.body.endLocation,
        graph,
        routes
      );
      preferencePath = [tmp.resultPath];
      preferenceRoute = tmp.resultRoute;
      console.log(resultPath);
      break;
    }
    case "minimum-lift": {
      const tmp = findMinimumLiftUsageRoute(
        req.body.startLocation,
        req.body.endLocation,
        graph,
        routes
      );
      preferencePath = [tmp.resultPath];
      preferenceRoute = tmp.resultRoute;
      console.log("hi", preferencePath);
      break;
    }
    default: {
      [resultPath, resultRoute] = await findAllRoutes(
        req.body.startLocation,
        req.body.endLocation,
        req.body.difficulty,
        null,
        resultPath,
        resultRoute
      );
      res.json({
        resultPath: resultPath,
        resultRoute: resultRoute,
      });
      return;
    }
  }

  res.json({
    resultPath: preferencePath,
    resultRoute: preferenceRoute,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
