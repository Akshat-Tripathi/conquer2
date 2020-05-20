import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { UnderConstruction } from "./pages/UnderConstruction";
import MapDisplay from "./pages/Map.jsx";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <div>
              <Route exact path="/" component={Home} />
              <Route path="/underdev" component={UnderConstruction} />
              <Route path="/game" component={MapDisplay} />
            </div>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
