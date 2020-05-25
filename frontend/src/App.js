import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home.jsx";
import { UnderConstruction } from "./pages/UnderConstruction";
import GameMap from "./pages/Map.jsx";
import Intro2 from "./shashgonenuts/intro2.jsx";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <div>
              <Route exact path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/underdev" component={UnderConstruction} />
              <Route path="/game" component={GameMap} />
              <Route path="/map" component={GameMap} />

              {/* ALPHA TESTING PURPOSES ONLY. PROHIBIT PUBLIC ACCESS*/}
              <Route path="/alpha" component={Intro2} />
            </div>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
