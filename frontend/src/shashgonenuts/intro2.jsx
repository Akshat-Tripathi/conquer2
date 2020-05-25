import React from "react";
import "./intro.scss";
import { Redirect } from "react-router-dom";

class Intro2 extends React.Component {
  state = {
    redirect: false,
  };

  componentDidMount() {
    this.id = setTimeout(() => this.setState({ redirect: true }), 15000);
  }

  componentWillUnmount() {
    clearTimeout(this.id);
  }

  render() {
    return this.state.redirect ? (
      <Redirect to="/game" />
    ) : (
      <>
        <div className="intro2">
          <div
            style={{
              overflow: "hidden",
              position: "absolute",
              left: 0,
              top: 0,
              width: "50px",
              height: "25px",
            }}
          >
            <div style={{ marginTop: "-290px" }}>
              <object width={420} height={315}>
                <param
                  name="movie"
                  value="https://www.youtube.com/v/EjMNNpIksaI?version=3&hl=en_US&autoplay=1&autohide=2"
                />
                <param name="allowFullScreen" value="true" />
                <param name="allowscriptaccess" value="always" />
                <iframe src="./intro.mp3" allow="autoplay" id="audio"></iframe>
                <audio id="player" autoplay loop>
                  <source src="audio/source.mp3" type="audio/mp3" />
                </audio>
              </object>
            </div>
          </div>
          <p id="start">
            A very very short time ago, Akshat and Shashwat decided it was
            time.…
          </p>
          <h1>
            CONQUER<sub>2.0: The Sequel</sub>
          </h1>
          <div id="titles">
            <div id="titlecontent">
              <p className="center">
                EPISODE II
                <br />A NEW HOPE FOR WORLD CONQUER
              </p>
              <p>
                You, a young chap in this chaotic, mindless world, have decided
                it is time for vengeance.
              </p>
            </div>
          </div>
          <iframe
            style={{ visibility: "hidden" }}
            width={560}
            height={315}
            src="https://www.youtube.com/embed/1KAOq7XX2OY"
            frameBorder={0}
            allowFullScreen
          />
        </div>
      </>
    );
  }
}

export default Intro2;
