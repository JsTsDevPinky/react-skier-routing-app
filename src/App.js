import React, { useEffect, useState } from "react";
import "./App.css";
import { points, graph, routes } from "./routes";
import axios from "axios";

function App() {
  const [showMainPage, setShowMainPage] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [preference1, setPreference] = useState(null);
  const [resultPath, setResultPath] = useState([]);
  const [mode, setMode] = useState("start");
  const [displayGraph, setDisplayGraph] = useState(null);
  const [resultRoute, setResultRoute] = useState([]);
  let preference = null;

  const CurveBetweenPoints = ({ startPoint, endPoint, routeId, index }) => {
    const route = routes.find((each) => each.id === routeId);

    // Convert percentage coordinates to pixel values
    const containerWidth = (window.innerWidth * 9.1) / 12; // Assuming width of container
    const containerHeight = window.innerHeight * 1.04; // Assuming height of container

    const startX = (startPoint.x / 100) * containerWidth;
    const startY = (startPoint.y / 100) * containerHeight;
    const endX = (endPoint.x / 100) * containerWidth;
    const endY = (endPoint.y / 100) * containerHeight;

    // Calculate the control point
    const controlPointX = (startX + endX) / 2;
    const controlPointY =
      index % 3 === 0
        ? startY
        : index % 3 === 1
        ? startY + index * 50
        : startY - index * 50; // Adjust this value to control the curve

    // SVG path data
    const path = `M${startX},${startY} Q${controlPointX},${controlPointY} ${endX},${endY}`;

    return (
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d={path}
          fill="none"
          stroke={`${
            route.level === "lift"
              ? route.status === "open"
                ? "green"
                : "red"
              : route.level === "easy"
              ? "blue"
              : route.level === "medium"
              ? "red"
              : "black"
          }`}
          strokeWidth={`${route.level === "lift" ? "4" : "1"}`}
          id={route.level}
        />
      </svg>
    );
  };

  const GraphVisualization = (graph) => {
    const svgElements = [],
      visitedRoute = [];

    // Loop through each node in the graph
    for (const [startNode, connections] of Object.entries(graph)) {
      const startPoint = points.find((point) => point.label === startNode);

      // Loop through each connection from the current node
      for (const [endNode] of Object.entries(connections)) {
        const endPoint = points.find((point) => point.label === endNode);
        if (startPoint && endPoint) {
          connections[endNode].map((item, index) => {
            if (!visitedRoute.includes(item)) {
              if (
                resultRoute.length > 0 &&
                resultRoute.findIndex((each) => each.id === item) < 0
              )
                return;
              visitedRoute.push(item);
              svgElements.push(
                <CurveBetweenPoints
                  key={`${startPoint.x}-${item}`}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  routeId={item}
                  index={index}
                />
              );
            }
          });
        }
      }
    }

    return (
      <div
        style={{
          position: "relative",
          width: window.innerWidth,
          height: window.innerHeight,
          zIndex: "0",
        }}
      >
        {svgElements}
      </div>
    );
  };

  const handlePointClick = (point) => {
    if (!startLocation) {
      setStartLocation(point);
      setMode("end");
    } else if (!endLocation) {
      setEndLocation(point);
      setMode("difficulty");
    } else {
      handleInit();
      setStartLocation(point);
      setMode("end");
    }
  };

  const handleCalculateRoute = () => {
    axios
      .post("http://localhost:5000/api/calculateRoute", {
        startLocation: startLocation,
        endLocation: endLocation,
        difficulty: selectedDifficulty,
        preference: preference,
      })
      .then((res) => {
        setResultPath(res.data.resultPath);
        setResultRoute(res.data.resultRoute);
        console.log(res.data.resultPath);
        handleSelectRoute(
          res.data.resultPath.reduce((acc, curr) => acc.concat(curr), [])
        );
      })
      .catch((err) => console.log("err", err));

    setMode("calculate");
  };

  const handlePreferenceChange = (e) => {
    preference = e.target.value;
    setPreference(e.target.value);
    handleCalculateRoute();
  };

  const handleInit = () => {
    setStartLocation(null);
    setEndLocation(null);
    setSelectedDifficulty([]);
    setMode("start");
    setResultPath([]);
    setResultRoute([]);
    setDisplayGraph(GraphVisualization(graph));
    preference = null;
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleDifficulty = (e) => {
    setMode("difficulty");
    setSelectedDifficulty(
      e.target.checked
        ? selectedDifficulty.concat(e.target.value)
        : selectedDifficulty.filter((item) => item !== e.target.value)
    );
  };

  function extractSubset(graph, keys) {
    const subset = {};
    for (const key of keys) {
      if (graph[key]) {
        subset[key] = {};
        for (const innerKey in graph[key]) {
          if (keys.includes(innerKey)) {
            subset[key][innerKey] = graph[key][innerKey];
          }
        }
      }
    }
    return subset;
  }

  const handleSelectRoute = (route) => {
    console.log("route", route);
    setDisplayGraph(GraphVisualization(extractSubset(graph, route)));
  };

  useEffect(() => {
    setDisplayGraph(GraphVisualization(graph));
  }, []);

  useEffect(() => {
    resultRoute.length > 0 &&
      setDisplayGraph(
        GraphVisualization(
          extractSubset(
            graph,
            resultPath.reduce((acc, curr) => acc.concat(curr), [])
          )
        )
      );
  }, [resultRoute]);

  return (
    <div className="App">
      {!showMainPage && (
        <div className="initial-page py-5">
          <h1>Welcome to the Skier Routing App</h1>
          <h2>This app is created by Group #2</h2>
          <br></br>
          <div className="groupmembers">
            <h4>Name - ID</h4>
          </div>
          <br></br>
          <p>Click the button below to get started.</p>
          <button onClick={() => setShowMainPage(true)}>Calculate Route</button>
        </div>
      )}
      {showMainPage && (
        <div className="main-page row">
          <div className="map col-md-9 col-sm-12">
            {displayGraph}

            {points.map((item) => (
              <div key={item.x + item.y}>
                <div
                  className={`point ${
                    startLocation === item.label ? "start" : ""
                  } ${endLocation === item.label ? "end" : ""}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  onClick={() => handlePointClick(item.label)}
                >
                  {item.label}
                </div>
                {startLocation === item.label && (
                  <span
                    className="label"
                    style={{ left: `${item.x + 2}%`, top: `${item.y - 3}%` }}
                  >
                    start
                  </span>
                )}
                {endLocation === item.label && (
                  <span
                    className="label"
                    style={{ left: `${item.x + 2}%`, top: `${item.y - 3}%` }}
                  >
                    end
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="find-path col-md-3 col-sm-12">
            <div className="action">
              {mode === "start" && <h3>Pick a start location</h3>}
              {mode === "end" && <h3>Pick an end location</h3>}
              {(mode === "difficulty" || mode === "calculate") && (
                <>
                  <h3>Select difficulty level:</h3>
                  <div className="py-3">
                    <input
                      type="checkbox"
                      id="easy"
                      name="difficulty"
                      value="easy"
                      className="mx-2"
                      onClick={handleDifficulty}
                    />
                    <label htmlFor="easy">Easy</label>
                    <input
                      type="checkbox"
                      id="medium"
                      name="difficulty"
                      value="medium"
                      className="mx-2"
                      onClick={handleDifficulty}
                    />
                    <label htmlFor="medium">Medium</label>
                    <input
                      type="checkbox"
                      id="hard"
                      name="difficulty"
                      value="hard"
                      className="mx-2"
                      onClick={handleDifficulty}
                    />
                    <label htmlFor="hard">Hard</label>
                  </div>
                  <button onClick={handleCalculateRoute}>
                    Calculate Route
                  </button>
                  {mode === "calculate" && (
                    <p>{`${resultPath.length} routes are found`}</p>
                  )}
                  {resultPath.map((route, index) => (
                    <p
                      key={index}
                      className="route"
                      onClick={() => {
                        handleSelectRoute(route);
                      }}
                    >
                      {Array.isArray(route)
                        ? `Route ${index + 1} = ${route.join("->")}`
                        : `${route} ->`}
                    </p>
                  ))}
                  {resultPath.length > 0 && (
                    <div className="my-5">
                      <h3>Select preference</h3>
                      <select
                        onChange={handlePreferenceChange}
                        className="my-3"
                      >
                        <option value="">Select an option</option>
                        <option value="shortest">Shortest</option>
                        <option value="easiest">Easiest</option>
                        <option value="fastest">Fastest</option>
                        <option value="minimum-lift">Minimum Lift Usage</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
            {startLocation !== null &&
              endLocation !== null &&
              preference1 !== null && (
                // resultPath.length > 0 &&
                <div className="my-5">
                  <h3>
                    {resultPath.length > 0 ? "Route Found" : "No route found"}
                  </h3>
                  {resultPath.length > 0 && (
                    <p>
                      You've selected the best route based on your preference.
                    </p>
                  )}
                  <button onClick={handleReset}>Choose a different path</button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
