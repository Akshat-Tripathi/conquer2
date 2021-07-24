import React from "react";
import "./Play.css";
import Logo from "../../../media/conquer2logo.png";
import StartGameBox from "../StartGameBox";
import Preloader from "../ComingSoon/Preloader/Preloader";
import Header from "../Header";
import Footer from "../Footer";
import Fireball from "../../../media/fireball.mp4"
import "../Jumbotron.css"

function Play() {
  return (
    <div className="">
      <Header />
      <div className="hero-container">
        <video src={Fireball} autoPlay loop muted />
        <div className="grid grid-cols-3 grid-gap-2">
          <div className="col-span-1 col-start-2 p-16">
            <StartGameBox />
            {/* Sign In here */}
          </div>
          <Preloader />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Play;
