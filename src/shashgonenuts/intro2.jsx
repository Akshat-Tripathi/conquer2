import React from "react";
import "./intro.scss";
import { Redirect } from "react-router-dom";
import audioPlayer from "./audioplayer.jsx";

class Intro2 extends React.Component {
  render() {
    return (
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
                <audioPlayer />
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
                it is time for change. In your duty to free the people from
                freedom, you decide you must be generous and liberate the world
                from their own rule and accept their fates - your supreme
                leadership.{" "}
              </p>

              <p>
                You must quell the rebellious and stubborn nature of the other
                foolish players who dare stand in your path, with the
                compansionship of your loyal army and precious lands, to restore
                order and justice to the world so that they may see the same
                bright vision you embrace.
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
