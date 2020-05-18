/*import React, { Component, useEffect, useRef } from "react";
import videoSource from "../media/HomeBackgroundVideo.mp4";
import {
  Typography,
  Box,
  makeStyles,
  Button,
  TextField,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import "./Home.css";
*/
//TODO: ADD A FUNCTIONING FORM - FORMIK?

function Credits() {
  return (
    <div className="credits">
      <Box color="white">
        <Typography variant="body2" color="gray" align="center">
          {"Copyright © "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
      </Box>
    </div>
  );
}

function Title() {
  return (
    <div className="title-head">
      <Box align="center" color="white">
        <Typography variant="h2">CONQUER V2.0</Typography>
      </Box>
      <Box color="white" align="center">
        <Typography variant="subtitle1" align="center">
          by Shashwat Kansal and Akshat Tripathi
        </Typography>
      </Box>
    </div>
  );
}

const gamemodes = [
  {
    label: "World Conquest - 2025",
    value: "WC",
  },
  {
    label: "World War I - 1914",
    value: "EW",
  },
  {
    label: "American Independence War - 1776",
    value: "ACW",
  },
  {
    label: "Genghis Khan's Expedition - 1333",
    value: "GKE",
  },
  {
    label: "The Mahabharata - 3200BCE",
    value: "MB",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onSubmit = async (values) => {
  await sleep(300);
  window.alert(JSON.stringify(values, 0, 2));
};

class gameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      gamemode: null,
      noOfPlayers: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const ign = target.username;
  }
}

function StartGameBox(props) {
  //Collect form information
  const state = {
    username: "Genghis Khan",
    gamemode: "WC",
    noOfPlayers: 6,
  };

  //List the gamemode options
  const [war, setWar] = React.useState("World Conquest 2025");

  const handleChange = (event) => {
    setWar(event.target.value);
  };

  return (
    <div className="wrapper">
      <div className="form-wrapper">
        <h3 className="gamebox-title">Join the game!</h3>
        <form noValidate>
          <div className="username">
            <label>Username</label>
            <input
              placeholder="Genghis Khan"
              type="text"
              name="username"
              noValidate
            />
          </div>
          <div className="gamemode">
            <label>Game mode</label>
            <input />
          </div>
          <div className="noOfPlayers">
            <label>Number of Players</label>
            <input />
          </div>
          <div className="commence-war">
            <button type="submit">COMMENCE WAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Video() {
    React.useEffect(() => {
    attemptPlay();
  }, []);

  const videoEl = useRef(null);

  const attemptPlay = () => {
    videoEl &&
      videoEl.current &&
      videoEl.current.play().catch((error) => {
        console.error("Error attempting to play", error);
      });
  };

  return (
    <div className="video">
      <video loop muted autoPlay className="home-video" id="home-video">
        <source
          playsInline
          src={videoSource}
          type="video/mp4"
          alt="This is Sparta!"
        />
        What kind of browser version are you on... Your browser unfortunately
        does not yet support the video tag!
      </video>
    </div>
  );
}

class Home1 extends React.Component {
    render() {
        return (
            <div className="home-page">
        <Video />
        <Title />
        <StartGameBox />
        <Credits />
      </div>
    );
  }
}
class App extends React.Component {
    render() {
        return (<Video />);
    }
  }

  ReactDOM.render(<App />, document.getElementById('app'));