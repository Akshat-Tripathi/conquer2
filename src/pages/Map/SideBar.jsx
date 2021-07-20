import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SpyDetails, PlayerBox, Title } from "./Texts";
import { Options, OptionsDeploy, DonateForm, AllianceForm, repeatAction } from "./ActionButtons";
import VectorMap from "./VectorMap";
import { Paper, Grid } from "@material-ui/core";
import useStyles from "./SideBarStyles";
import { GameContext, getUserTroops, getOwner, parseCookie } from "./Map";
import SidebarGeneral from "./Components/Sidebar";
import ChatPopup from "./ChatPopup";
import HelpIcon from "@material-ui/icons/Help";
import { Snackbar, IconButton } from "@material-ui/core";
import "./SideBar.css";

//PRE: A hex colour of the format #______ and a percentage p (0 < p < 1)
//POST: The hex colour, p% darker
function darken(hex, p) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - p));
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - p));
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - p));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function SideBar({ isUnrelated, base }) {
  //CSS
  const classes = useStyles();
  const [hidden, setHidden] = useState(false);
  const [hideUnrelated, setHideUnrelated] = useState(false);

  useHotkeys("q", () =>
    setHidden((bool) => {
      return !bool;
    })
  );

  useHotkeys("r", () => repeatAction(GameContext.gameSocket), { keyup: true });

  useHotkeys("c", () =>
    setHideUnrelated((bool) => {
      return !bool;
    })
  );

  // Spy Detail Information
  const [name, setname] = useState("");
  const [pop_est, setpop_est] = useState("");
  const [gdp, setgdp] = useState("");
  const [subrg, setsubrg] = useState("");
  const [continent, setcontinent] = useState("");

  //Currently Clicked Countries
  const [fromCountry, setfromCountry] = useState("");
  const [toCountry, settoCountry] = useState("");
  const [toCountryOwner, settoCountryOwner] = useState("");

  //For the snackbar display settings
  const [openHelp, setOpenHelp] = React.useState(false);

  //Show Deployment option?
  const [allowDeploy, setallowDeploy] = useState(false);

  //Show Move option?
  const [allowMove, setallowMove] = useState(false);

  //Show drop downs?
  const [showDonate, setshowDonate] = useState(false);
  const [showAlliance, setshowAlliance] = useState(false);
  const [showAssist, setshowAssist] = useState(false);
  const [showMove, setshowMove] = useState(false);
  const [showDeploy, setshowDeploy] = useState(false);

  //For sending socket message actions (e.g. donate)
  const [targetPlayer, settargetPlayer] = useState("");
  const [numTroops, setnumTroops] = useState(0);

  //Load up map initially
  const [countriesLoaded, setcountriesLoaded] = useState(false);

  // Map of ALL countries and their borders
  const [countries, changeCountries] = useState({});

  //TODO: Generalize for Different Game Maps
  function loadMap() {
    fetch(
      window.location
        .toString()
        .replace(":3000", ":80")
        .replace("game", "maps/world.txt"),
      {
        mode: "cors",
      }
    )
      .then((raw) => {
        console.log(raw);
        return raw.text();
      })
      .then((raw) => {
        let sep = raw.includes("\r") ? "\r\n" : "\n";
        return raw.split(sep);
      })
      .then((lines) => lines.map((s) => s.split(" ")))
      .then((lines) =>
        lines.forEach((line) => {
          changeCountries((state) => ({
            ...state,
            [line[0]]: line.slice(1),
          }));
        })
      );
  }

  if (!countriesLoaded) {
    loadMap();
    setcountriesLoaded(true);
  }

  const convertISO = (NAME, ISO_A2) => {
    if (NAME === "Somaliland") return "ZZ";
    if (NAME === "N. Cyprus") return "CP";
    return ISO_A2;
  };

  // ISO_A2 of source country
  const [fromCountryISO, setFromCountryISO] = useState("");
  // ISO_A2 of dest country
  const [toCountryISO, setToCountryISO] = useState("");

  const handleClick = (geo) => {
    const { NAME, ISO_A2 } = geo.properties;

    var iso_a2 = convertISO(NAME, ISO_A2);

    if (fromCountry === "" && GameContext.countryStates[iso_a2].Player) {
      if (
        getOwner(GameContext.countryStates[iso_a2].Player) ===
        getOwner(GameContext.user)
      ) {
        setFromCountryISO(iso_a2);

        setfromCountry(NAME);
        setallowDeploy(true);
      }
    } else if (NAME === fromCountry) {
      reset();
    } else if (countries[fromCountryISO].some((iso) => iso === iso_a2)) {
      setallowDeploy(false);
      settoCountry(NAME);
      let c = GameContext.countryStates[iso_a2];
      settoCountryOwner(c === undefined ? "" : c.Player);
      setToCountryISO(iso_a2);
      if (
        getOwner(GameContext.countryStates[iso_a2].Player) ===
        getOwner(GameContext.user)
      ) {
        setallowMove(true);
      } else {
        setallowMove(false);
      }
    } else {
      if (
        getOwner(GameContext.countryStates[iso_a2].Player) ===
        getOwner(GameContext.user)
      ) {
        setFromCountryISO(iso_a2);

        setfromCountry(NAME);
        setallowDeploy(true);
      }
    }
  };

  const reset = () => {
    setToCountryISO("");
    setFromCountryISO("");
    setfromCountry("");
    settoCountry("");
    settoCountryOwner("");
    setallowDeploy(false);
    setallowMove(false);
  };

  //Handle functions for snackbar
  const handleOpenHelp = () => {
    setOpenHelp(true);
  };

  const handleDonate = () => {
    setshowDonate(!showDonate);
    if (!showDonate) {
      setnumTroops(0);
    }
  };

  const fillFromBase = (p) => {
    let troops = GameContext.troops;
    setnumTroops(Math.round(troops * p));
  }

  const fillFromCountry = (p, fromCountryISO) => {
    let troops = GameContext.countryStates[fromCountryISO].Troops - 1;
    setnumTroops(Math.round(troops * p));
  }

  const handleAssist = () => {
    setshowAssist(!showAssist);
    if (!showAssist) {
      setnumTroops(0);
    }
  };

  const handleAlliance = () => {
    setshowAlliance(!showAlliance);
    if (!showAlliance) {
      setnumTroops(0);
    }
  }

  const handleMove = () => {
    setshowMove(!showMove);
    if (!showMove) {
      setnumTroops(0);
    }
  };

  const handleDeploy = () => {
    setshowDeploy(!showDeploy);
    if (!showDeploy) {
      setnumTroops(0);
    }
  };

  const handleCloseHelp = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenHelp(false);
  };

  //FIXME: Use useState hook here to avoid lag ?
  const handleNumTroops = (event) => {
    console.log(event.target.value);
    setnumTroops(event.target.value);
  };

  const handletargetPlayer = (event) => {
    settargetPlayer(event.target.value);
  };

  const handleColorFill = (geo) => {
    while (!countriesLoaded) { }
    const { NAME, ISO_A2 } = geo.properties;

    var iso_a2 = convertISO(NAME, ISO_A2);

    if (hideUnrelated && isUnrelated(iso_a2)) {
      return "none";
    }

    try {
      var col = "#a69374";
      if (GameContext.countryStates[iso_a2] !== undefined) {
        if (GameContext.countryStates[iso_a2].Player !== "") {
          col =
            GameContext.playerColours[
            getOwner(GameContext.countryStates[iso_a2].Player)
            ];
        }
      }
      if (
        fromCountryISO !== "" &&
        countries[fromCountryISO] !== undefined &&
        countries[fromCountryISO].some((iso) => iso === iso_a2)
      ) {
        return darken(col, 0.2);
      }
      return col;
    } catch (TypeError) {
      return "#a69374";
    }
  };

  return (
    <div>
      {GameContext.players.length > 0 && (
        <PlayerBox
          classes={classes}
          playerColours={GameContext.playerColours}
          hidden={hidden}
          allegiances={GameContext.allegiances}
        />
      )}
      <ChatPopup />
      {!hidden ? (
        <div className="absolute inset-y-0 right-0 w-1/4 h-screen bg-black opacity-90 rounded-l-xl">
          {/* <Paper className={classes.sidebar}> */}
          <IconButton
            aria-label="help"
            color="primary"
            size="small"
            onClick={handleOpenHelp}
            className="outline-none focus:outline-none"
          >
            <HelpIcon
              style={{
                fontSize: "20",
              }}
            />
          </IconButton>
          <div className="text-center">
            <Title
              handleCloseHelp={handleCloseHelp}
              handleOpenHelp={handleOpenHelp}
              openHelp={openHelp}
              user={GameContext.user}
              troops={GameContext.troops}
              startTime={base}
              interval={GameContext.interval}
              nextTroops={getUserTroops()}
            />
            <div style={{ marginTop: "50px", width: "100%" }}>
              {/* Show Donation options when clicked on Donate Button */}
              {fromCountry === "" && (
                <div>
                  <div>
                    <DonateForm
                      classes={classes}
                      handleDonate={handleDonate}
                      handletargetPlayer={handletargetPlayer}
                      handleNumTroops={handleNumTroops}
                      fillTroops={fillFromBase}
                      showDonate={showDonate}
                      numTroops={numTroops}
                      targetPlayer={targetPlayer}
                      socket={GameContext.gameSocket}
                      user={GameContext.user}
                      players={GameContext.players}
                      reset={reset}
                    />
                  </div>

                  <AllianceForm
                    classes={classes}
                    handleAlliance={handleAlliance}
                    handletargetPlayer={handletargetPlayer}
                    handleNumTroops={handleNumTroops}
                    fillTroops={fillFromBase}
                    showAlliance={showAlliance}
                    numTroops={numTroops}
                    targetPlayer={targetPlayer}
                    socket={GameContext.gameSocket}
                    user={GameContext.user}
                    players={GameContext.players}
                    reset={reset}
                    alliances={GameContext.alliances}
                  />
                </div>)}

              {/* Only show Attack and move/assist options when two countries clicked */}
              {toCountry !== "" && (
                <Options
                  classes={classes}
                  toCountry={toCountry}
                  fromCountry={fromCountry}
                  toCountryOwner={toCountryOwner}
                  allowMove={allowMove}
                  numTroops={numTroops}
                  handleNumTroops={handleNumTroops}
                  handleMove={handleMove}
                  handleAssist={handleAssist}
                  fillTroops={(p) => fillFromCountry(p, fromCountryISO)}
                  showMove={showMove}
                  showAssist={showAssist}
                  fromCountryISO={fromCountryISO}
                  toCountryISO={toCountryISO}
                  socket={GameContext.gameSocket}
                  user={GameContext.user}
                  reset={reset}
                />
              )}

              {/* Deploy troops from base to country */}
              {allowDeploy && (
                <OptionsDeploy
                  classes={classes}
                  numTroops={numTroops}
                  handleNumTroops={handleNumTroops}
                  fillTroops={fillFromBase}
                  fromCountry={fromCountry}
                  handleDeploy={handleDeploy}
                  showDeploy={showDeploy}
                  fromCountryISO={fromCountryISO}
                  socket={GameContext.gameSocket}
                  user={GameContext.user}
                  troops={GameContext.troops}
                  reset={reset}
                />
              )}
            </div>
            {/* Only Show SpyDetails when not clicked anything */}

            {fromCountry === "" && name !== "" && (
              <SpyDetails
                name={name}
                subrg={subrg}
                continent={continent}
                pop_est={pop_est}
                gdp={gdp}
              />
            )}

            {/* </Paper> */}
          </div>
        </div>
      ) : null}
      <div style={{ backgroundPosition: "cover" }}>
        <VectorMap
          setname={setname}
          setpop_est={setpop_est}
          setsubrg={setsubrg}
          setcontinent={setcontinent}
          setgdp={setgdp}
          handleColorFill={handleColorFill}
          handleClick={handleClick}
          countryStates={GameContext.countryStates}
          convertISO={convertISO}
          hideUnrelated={hideUnrelated}
          isUnrelated={isUnrelated}
        />
      </div>
    </div>
  );
}

export default SideBar;
