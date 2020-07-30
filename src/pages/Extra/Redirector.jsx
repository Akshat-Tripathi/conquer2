import React from "react";
import Intro2 from "../../shashgonenuts/intro2.jsx";
import { Redirect } from "react-router-dom";

class Redirector extends React.Component {
  state = {
    redirect: false,
  };

  componentDidMount() {
    this.id = setTimeout(() => this.setState({ redirect: true }), 35000);
  }

  componentWillUnmount() {
    clearTimeout(this.id);
  }

  render() {
    return this.state.redirect ? <Redirect to="/" /> : <Intro2 />;
  }
}

export default Redirector;
