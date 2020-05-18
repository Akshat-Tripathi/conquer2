import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { UnderConstruction } from "./pages/UnderConstruction";
// import {} from "frontend/src/pages/SVG-World-Map/src/svg-world-map.js";
import { svgWorldMap } from "frontend/src/pages/SVG-World-Map/src/svg-world-map.js";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <div>
              <Route exact path="/" component={Home} />
              <Route path="/underdev" component={UnderConstruction} />
              <Route path="/map" component={svgWorldMap} />
            </div>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
