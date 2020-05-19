import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { UnderConstruction } from "./pages/UnderConstruction";
import MapDisplay from "/Users/shashwatkansal/Documents/Projects/conquer2/V0.2/conquer2/frontend/src/pages/Map.jsx";
// import {} from "frontend/src/pages/SVG-World-Map/src/svg-world-map.js";
// import { svgWorldMap } from "/Users/shashwatkansal/Documents/Projects/conquer2/V0.2/conquer2/frontend/src/pages/SVG-World-Map/src/svg-world-map.js";
// import "/Users/shashwatkansal/Documents/Projects/conquer2/V0.2/conquer2/frontend/src/pages/SVG-World-Map/demo/basics.html";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <div>
              <Route exact path="/" component={Home} />
              <Route path="/underdev" component={UnderConstruction} />
              <Route path="/map" component={MapDisplay} />
              <Route path="/plswork">
                <LoadMap />
              </Route>
            </div>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

const htmlFile = require("/Users/shashwatkansal/Documents/Projects/conquer2/V0.2/conquer2/frontend/src/pages/SVG-World-Map/demo/basics.html");

class LoadMap extends React.Component {
  render() {
    return <div dangerouslySetInnerHTML={{ __html: htmlFile }} />;
  }
}

export default App;
