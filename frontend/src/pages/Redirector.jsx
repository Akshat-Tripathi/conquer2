import React from "react";
import GameMap from "./Map.jsx";
import Intro2 from "../shashgonenuts/intro2.jsx";
import { Redirect } from "react-router-dom";

class Redirector extends React.Component {
  state = {
    redirect: false,
  };

  componentDidMount() {
    this.id = setTimeout(() => this.setState({ redirect: true }), 25000);
  }

  componentWillUnmount() {
    clearTimeout(this.id);
  }

  render() {
    return this.state.redirect ? <GameMap /> : <Intro2 />;
  }
}

export default Redirector;
