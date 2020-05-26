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
import { useForm } from "react-hook-form";

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

function fancyTitle() {
  return (
    <>
      <div className="rainbow-text">
        <div className="title-text">
          <span className="letters">C</span>
          <span className="letters">O</span>
          <span className="letters">N</span>
          <span className="letters">Q</span>
          <span className="letters">U</span>
          <span className="letters">E</span>
          <span className="letters">R </span>
          <span className="letters">2.0</span>
        </div>
      </div>
    </>
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

var username;
function StartGameBox(props) {
  //Collect form information

  //List the gamemode options

  const handleUsername = () => {
    username = document.getElementById("ign");
  };

  return (
    <div className="wrapper">
      <div className="form-wrapper">
        <h3 className="gamebox-title">Join the game!</h3>

        <form action="/join" method="POST">
          <div className="username">
            <input
              type="text"
              id="ign"
              placeholder="Username"
              name="username"
              required
              onChange={handleUsername}
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

//FIXME: Names/id of each of the inputs needs to be fixed
//TODO: Replace forms, fit inside <div> tag, then improve UI (MaterialUI??)

function LoginToGame() {
  const { register, handleSubmit, errors } = useForm();

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

class Home extends Component {
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

export default Home;
export { username };
