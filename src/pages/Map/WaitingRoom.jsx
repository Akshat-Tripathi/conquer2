import React, { Component, useState, useEffect } from "react";
import { Typography, IconButton } from "@material-ui/core";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import { GiThumbUp, GiInfo } from "react-icons/gi";
import { action } from "../Map/ActionButtons";
import { FcCheckmark, FcCancel } from "react-icons/fc";
import { useSpring, animated as a, useTransition } from "react-spring";
import "./WaitingRoom.css";
import ChatPopup from "./ChatPopup";

// class readyPlayer {
// 	constructor(Player, IsReady) {
// 		this.Player = Player;
// 		this.IsReady = IsReady;
// 		this.Type = 'readyPlayer';
// 	}
// }

function handleVote({ socket, user }) {
  //TODO: send vote request and add ready up thingy
  // const readyup = new action(null, 'readyUp', null, null, this.props.user);
  // const readyup = new readyPlayer(this.props.user, true);

  const readyup = new action(0, "imreadym9", "", "", user);
  socket.send(JSON.stringify(readyup));
}

const ResponsiveWaitingRoom = ({
  playerColours,
  user,
  socket,
  playerReady,
}) => {
  const ImReady = playerReady[user];

  return (
    <div className="">
      {/* Backdrop */}
      <div className="backdrop" />

      {/* Title */}
      <div className="text-center align-middle md:grid md:grid-cols-5 flex md:flex-none flex-col p-8">
        <div className="col-span-3 col-start-2">
          <h1 className="text-yellow-400 text-5xl font-bold p-4">
            Waiting for all players...
          </h1>

          {/* Retrieve Game ID from Browser Cookies */}
          <p className="text-white">
            {"Game ID: " +
              document.cookie
                .split("; ")
                .map((s) => s.split("="))
                .filter((arr) => arr[0] == "id")[0][1]}
          </p>

          {/* Tips box */}
          <div className="m-4 w-96 h-64 text-yellow-400 mx-auto">
            <div className="bg-black bg-center opacity-75 text-center p-4 rounded-xl grid gap-2 grid-cols-3">
              <div className="">
                <GiInfo className="text-7xl" />
              </div>
              <div className="text-left text-sm col-span-2">
                <AssistancesSlider />
              </div>
            </div>
          </div>
        </div>

        {/* Hourglass */}
        <div className="p-8 absolute top-0 right-0 hidden md:block">
          <div className="lds-hourglass" />
        </div>

        {/* Players box */}
        <div
          className="bg-black md:col-start-1 md:col-span-1 md:left-0 md:bottom-0 md:absolute 
        md:w-64 md:h-96 md:rounded-tr-xl p-8 sm:rounded-xl hidden md:block"
        >
          {PlayerBoxMdScreen(playerColours, playerReady)}
        </div>

        <div
          className="block md:hidden bg-black rounded-xl"
        >
          Hello
        </div>

        {/* Chat Popup */}
        <div className="chat">
          <ChatPopup />
        </div>

        {/* Ready Up Box */}
        <ReadyUp ImReady={ImReady} socket={socket} user={user} />
      </div>
    </div>
  );
};

/**
 * Represents the ready up button and ready button when
 * clicked to indicate a player is ready to start from the lobby.
 */
const ReadyUp = ({ ImReady, socket, user }) => {
  return (
    <div className="">
      <div
        className="absolute md:bottom-0 md:right-0 md:h-64 md:w-64 bg-black 
      opacity-90 text-center p-8 rounded-tl-3xl sm:flex md:flex-none sm: flex-col"
      >
        {!ImReady ? (
          <div className="text-center">
            <IconButton
              aria-label="ready-up"
              style={{ color: "red" }}
              size="medium"
              onClick={() => handleVote({ socket, user })}
              className="outline-none focus:outline-none animate-bounce"
            >
              <h6
                className="text-center text-2xl capitalize font-bold"
                style={{ color: "red" }}
              >
                READY UP
              </h6>
              <DoubleArrowIcon
                style={{
                  fontSize: "50",
                }}
              />
            </IconButton>
          </div>
        ) : (
          <div className="readyup-icons">
            <IconButton
              aria-label="ready-up"
              style={{ color: "green" }}
              size="medium"
            >
              <GiThumbUp
                style={{
                  fontSize: "50",
                }}
              />
            </IconButton>
            <Typography variant="h6" style={{ color: "green" }}>
              READY
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadyIcon = (isReady) => (
  <div>
    {isReady ? (
      <i className="fas fa-check text-center text-green-600"></i>
    ) : (
      <FcCancel />
    )}
  </div>
);

const AssistancesSlider = () => {
  const [key, setKey] = useState(0);

  const scrolling = useSpring({
    from: { transform: "translate3d(0,0,0)" },
    to: { transform: "translate3d(0,0,0)" },
    config: { duration: 5000 },
    reset: true,
    //reverse: key % 2 == 0,
    onRest: () => {
      if (key === Assistances.length - 1) {
        setKey(0);
      } else {
        setKey(key + 1);
      }
    },
  });

  return (
    <div key={key}>
      <a.div style={scrolling} className="text-lg">
        {Assistances[key]}
      </a.div>
    </div>
  );
};

//TODO: Simplify the way we add text/assistances?
const Assistances = [
  "Press Q to remove dashboards while you're playing to see the map more clearly!",
  "Make sure to check what countries are bordering your countries when moving troops",
  "Don't leave 1 troops behind! They can accumulate and form a large army!",
  "Form alliances! One vs all approaches have hardly ever won the game!",
  "The faster you are able to click accurately, the more likely you are to succeed!",
  "Take note of France. It can be your friend from two continents, or your worst nightmare!",
  "Remember in peacetime: the more land you have, the more troops you get! ",
];

function PlayerBoxMdScreen(playerColours, playerReady) {
  return (
    <div className="">
      <div className="absolute md:bottom-0 md:left-0 bg-black opacity-90 w-64 h-96 text-center rounded-tr-3xl p-4">
        <div className="players-list-title">
          <h3 className="text-white text-2xl font-bold p-2">Joined Players </h3>
        </div>

        <div className="content-center flex flex-col">
          {Object.keys(playerColours).map(function (player) {
            var isReady = playerReady[player];
            var colour = playerColours[player];
            return (
              <div
                className="flex flex-row flex-auto text-center align-middle flex-no-wrap content-center flex-grow"
                key={player}
              >
                <div className="text-center pl-4">
                  <p
                    style={{ color: colour }}
                    className="text-center align-middle font-bold text-lg"
                  >
                    {player} &ensp;
                  </p>
                </div>
                <div className="">{ReadyIcon(isReady)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ResponsiveWaitingRoom;
