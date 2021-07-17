import React, { Component, useState } from "react";
import { connect, loaddetails } from "../../websockets/index.js";
import { Paper, makeStyles, Grid } from "@material-ui/core";
import "./Map.css";
import WaitingRoom from "./WaitingRoom";
import SideBar from "./SideBar";

class countryState {
  constructor(Troops, Player) {
    this.Troops = Troops;
    this.Player = Player;
  }
}

// var socket = connect();
// Number of troops in current player's base
// var troops = 0;
// List of all countries
// var countryStates = {};
// Map players to capitals
// var capitals = {};
//Map players to their owners
// var allegiances = {};
// List of all 'players: colours'
// var playerColours = {};
// List of all players
// var players = [];
// Current player name
// var user = '';
// Interval for troop drops
// var interval;
// Checking if everyone's ready
// var playerReady = {};
// The type of map to be used for game
// var gamemap = '';

//TODO: Use redux / React Context in the future to streamline global state as one immutable tree in DOM.
var GameContext = {
  gameSocket: undefined,
  chatSocket: undefined,
  troops: 0,
  countryStates: {},
  capitals: {},
  allegiances: {},
  playerColours: {},
  players: [],
  user: "",
  interval: undefined,
  playerReady: {},
  gamemap: "",
  globalChat: [],
};

function getUserTroops() {
  let userCountries = 0;
  for (var c in GameContext.countryStates) {
    if (GameContext.countryStates[c].Player === GameContext.user) {
      userCountries++;
    }
  }
  return 3 + Math.floor(userCountries / 6);
}

function getInterval() {
  console.log(document.cookie);
  const decodedCookie = decodeURIComponent(document.cookie)
    .replace(/ /g, "")
    .split(";");

  for (let i = 0; i < decodedCookie.length; i++) {
    const elem = decodedCookie[i].split("=");
    if (elem[0] === "type") {
      var type = elem[1];
      break;
    }
  }

  if (type === "realtime" || type === "capital") {
    for (let i = 0; i < decodedCookie.length; i++) {
      const elem = decodedCookie[i].split("=");
      if (elem[0] === "interval") {
        return elem[1];
      }
    }
  } else {
    return 8 * 60; //8 hours
  }
}

function parseCookie(txt) {
  return document.cookie
    .split("; ")
    .map((s) => s.split("="))
    .filter((arr) => arr[0] == txt)[0][1];
}

function getOwner(player) {
  while (player != GameContext.allegiances[player]) {
    player = GameContext.allegiances[player];
    if (player === undefined || player === "") {
      alert("glitch");
    }
  }
  return player;
}

function getGameMap() {
  //TODO: Get map to be used
  return "world";
}

class GameMap extends Component {
  constructor() {
    super();
    this.state = { lobby: true, base: parseCookie("start"), isUnrelated: null };

    let updateTime = () => {
      let date = new Date();
      this.setState({ base: Math.floor(date.getTime() / 1000) });
    };

    if (parseCookie("type") === "capital") {
      this.state.isUnrelated = (iso) => {
        return !Object.values(GameContext.capitals).includes(iso);
      };
    } else {
      this.state.isUnrelated = (iso) => {
        let v = GameContext.countryStates[iso];
        return typeof v === "undefined" || v.Player !== GameContext.user; //shouldn't need getOwner as it's definitely not a capital game
      };
    }

    GameContext.gameSocket = connect("game");
    GameContext.chatSocket = connect("chat");
    var keepAlive = (keepAlive = window.setInterval(() => {
      GameContext.gameSocket.send("{}");
    }, 54 * 1000));

    //Ascertain from cookies the base troop drop time intervals
    GameContext.interval = getInterval();
    //Ascertain from cookies the current player's username
    GameContext.user = parseCookie("username");
    //TODO: Ascertain from cookies the map to be used for the game
    GameContext.gamemap = getGameMap();

    GameContext.chatSocket.onmessage = (msg) => {
      //Add latest message to the globalChat
      console.log(msg);
      msg = JSON.parse(msg.data);
      let newMessage = {};
      newMessage[msg.Name] = msg.Text;
      console.log("message received, pushing to local vars.");
      let gc = GameContext.globalChat;
      gc.push(newMessage);
      this.forceUpdate();
      // this.setState({globalChat: this.state.globalChat.push(newMessage)});
    };

    GameContext.gameSocket.onmessage = (msg) => {
      var action = JSON.parse(msg.data);
      window.clearInterval(keepAlive);
      keepAlive = window.setInterval(() => {
        GameContext.gameSocket.send("{}");
      }, 54 * 1000);
      switch (action.Type) {
        case "updateTroops":
          GameContext.user = action.Player;
          GameContext.troops += action.Troops;
          if (action.ID == 1) {
            updateTime();
          }
          break;
        case "updateCountry":
          let ok =
            typeof GameContext.countryStates[action.Country] === "undefined";
          if (
            ok ||
            getOwner(GameContext.countryStates[action.Country].Player) !==
              getOwner(action.Player)
          ) {
            if (
              Object.keys(GameContext.capitals).some(
                (key) => GameContext.capitals[key] == action.Country
              )
            ) {
              //change allegiance
              GameContext.allegiances[
                GameContext.countryStates[action.Country].Player
              ] = getOwner(action.Player);
            }
            GameContext.countryStates[action.Country] = new countryState(
              action.Troops,
              action.Player
            );
          } else {
            //This should only be false in a campaign, when a country needs to be zeroed
            if (action.Player !== "") {
              GameContext.countryStates[action.Country].Troops += action.Troops;
              if (GameContext.countryStates[action.Country].Troops < 0) {
                console.log(action);
              }
            } else {
              if (
                Object.keys(GameContext.capitals).some(
                  (key) => GameContext.capitals[key] == action.Country
                )
              ) {
                //change allegiance
                GameContext.allegiances[
                  GameContext.countryStates[action.Country].Player
                ] = getOwner(action.Player);
              }
              GameContext.countryStates[action.Country].Troops = action.Troops;
            }
          }
          break;
        case "readyPlayer":
          GameContext.playerReady[action.Player] = true;
          break;
        case "start":
          this.setState({ lobby: false });
          break;
        case "newPlayer":
          if (!GameContext.players.some((player) => player === action.Player)) {
            console.log(
              action.Player + " has entered the chat bois as: " + action.Country
            );
            GameContext.playerColours[action.Player] = action.Country;
            GameContext.players.push(action.Player);
            GameContext.playerReady[action.Player] = false;
            GameContext.allegiances[action.Player] = action.Player;
          }
          break;
        case "newCapital":
          GameContext.capitals[action.Player] = action.Country;
          
          //If the country hasn't been registed, register it
          if (!GameContext.countryStates[action.Country]) {
            GameContext.countryStates[action.Country] = new countryState(action.Troops , action.Player);
          }
          
          GameContext.allegiances[action.Player] =
            GameContext.countryStates[action.Country].Player;
          break;
        case "won":
          alert(getOwner(action.Player) + " has conquered the world!");
          window.location.replace(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          );
          break;
      }
      this.forceUpdate();
    };
  }

  componentDidMount() {
    window.addEventListener("load", this.onLoad);
  }

  componentWillUnmount() {
    window.removeEventListener("load", this.onLoad);
  }

  onLoad() {
    window.scrollTo(0, window.screen.height / 3.8);
  }

  render() {
    return this.state.lobby ? (
      <WaitingRoom
        playerColours={GameContext.playerColours}
        user={GameContext.user}
        socket={GameContext.gameSocket}
        playerReady={GameContext.playerReady}
      />
    ) : (
      <body id="map-page">
        <SideBar isUnrelated={this.state.isUnrelated} base={this.state.base} />
      </body>
    );
  }
}

export default GameMap;
export { getUserTroops, getOwner, GameContext, parseCookie };
