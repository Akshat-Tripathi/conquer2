import React, { Component, useEffect, useRef } from "react";
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
// import { useForm } from "react-hook-form";

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
          by Imperium Games
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
    label: "American War of Independence- 1776",
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

//TODO: asynchronous doesn't matter here, no need for concurrency

const onSubmit = async (values) => {
  await sleep(300);
  window.alert(JSON.stringify(values, 0, 2));
};

//TODO: Improve or delete this junk code

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

        <form action="/join" method="POST">
          <div className="username">
            <input
              type="text"
              placeholder="Username"
              name="username"
              required
            ></input>
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              name="password"
              required
            ></input>
          </div>
          <div>
            <input type="text" placeholder="Game Id" name="id"></input>
          </div>
          <input type="submit" name="submit" value="join"></input>
        </form>

        <form action="/create" method="POST">
          <select className="gamemode" name="type" required>
            <option value="realtime">Realtime game</option>
          </select>
          <div>
            <input
              type="text"
              placeholder="Username"
              name="username"
              required
            ></input>
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              name="password"
              required
            ></input>
          </div>
          <div>
            <input
              className="noOfPlayers"
              type="number"
              placeholder="maxPlayers"
              name="maxPlayers"
              required
            ></input>
          </div>
          <div>
            <input
              type="number"
              placeholder="startingTroops"
              name="startingTroops"
              required
            ></input>
          </div>
          <div>
            <input
              type="number"
              placeholder="startingCountries"
              name="startingCountries"
              required
            ></input>
          </div>
          <div>
            <input
              type="number"
              placeholder="interval"
              name="troopInterval"
              required
            ></input>
          </div>
          <input type="submit" name="submit" value="create"></input>
        </form>
      </div>
    </div>
  );
}

//FIXME: Names/id of each of the inputs needs to be fixed according to GO API.
//TODO: Replace forms, fit inside <div> tag, then improve UI (MaterialUI??)

function LoginToGame() {
  const { register, handleSubmit, errors } = useForm();

  //TODO: Route onSubmit to GO API

  const onSubmit = (data) => console.log(data);
  console.log(errors);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          ref={register({ required: true, maxLength: 80 })}
        />
        <input
          type="password"
          placeholder="Password"
          name="Password"
          ref={register({ required: true, maxLength: 80 })}
        />
        <input
          type="text"
          placeholder="GameID"
          name="id"
          ref={register({ required: true, pattern: /^\S+@\S+$/i })}
        />

        <input type="submit" />
      </form>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="number"
          placeholder="Number Of Players"
          name="Number Of Players"
          ref={register({ required: true, max: 8, min: 2 })}
        />
        <input
          type="number"
          placeholder="Number of Starting Troops"
          name="Number of Starting Troops"
          ref={register({ required: true })}
        />
        <input
          type="number"
          placeholder="Troop Interval"
          name="Troop Interval"
          ref={register({ required: true })}
        />
        <select name="Gamemode" ref={register({ required: true })}>
          <option value="World Conquest - 2025">World Conquest - 2025</option>
          <option value="World War I - 1914">World War I - 1914</option>
          <option value="American War of Independence- 1776">
            American War of Independence- 1776
          </option>
          <option value="Genghis Khan's Expedition - 1333">
            Genghis Khan's Expedition - 1333
          </option>
          <option value="The Mahabharata - 3200BCE">
            The Mahabharata - 3200BCE
          </option>
        </select>

        <input type="submit" />
      </form>
    </div>
  );
}

function Video() {
  useEffect(() => {
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
      <video muted autoPlay className="home-video" id="home-video">
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

export default class Home extends Component {
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
