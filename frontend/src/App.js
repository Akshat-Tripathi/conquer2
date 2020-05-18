import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { MapDisplay } from "./pages/Map";
import { UnderConstruction } from "./pages/UnderConstruction";
import { Box } from "@material-ui/core";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <body>
              <Route exact path="/" component={Home} />
              <Route path="/map" component={MapDisplay} />
            </body>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
