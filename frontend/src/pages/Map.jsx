import React, { Component, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
// import { useSpring, animated } from "react-spring";
import "./Map.css";
import { connect, loaddetails } from "../api/index.js";
import Intro2 from "../shashgonenuts/intro2";
import { username } from "./Home.jsx";

import mapdata from "../maps/world.txt";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

var countries = {};
var socket = null;

class GameMap extends Component {
  constructor() {
    super();
    socket = connect();

    socket.onmessage = (msg) => {
      console.log(msg);
    };
  }

  render() {
    return <SideBar />;
  }
}

function SideBar() {
  //Fetch #troops, attack, move options, fix data vals
  const [state, setState] = useState("");

  const [name, setname] = useState("");
  const [pop_est, setpop_est] = useState("");
  const [gdp, setgdp] = useState("");
  const [subrg, setsubrg] = useState("");
  const [continent, setcontinent] = useState("");
  const [display, setdisplay] = useState(false);
  const [clickedCountry, setclickedCountry] = useState("");

  const handleclickedCountry = (ISO_A2) => {
    setclickedCountry(ISO_A2);
  };

  const handledoubleClicked = () => {
    setclickedCountry("");
  };

  const CountryDetails = () => {
    return (
      <div>
        <h2>Spy Report On {name}:</h2>
        <h3>Population: {pop_est}</h3>
        <h3>GDP (PPP): {gdp}</h3>
        {continent !== "South America" && <h3>Subregion: {subrg}</h3>}
        <h3>Continent: {continent}</h3>
      </div>
    );
  };

  const handleColourFill = (country) => {
    const { ISO_A2 } = country.properties;
    if (
      clickedCountry !== "" &&
      getCountryCodes(clickedCountry).includes(ISO_A2)
    ) {
      return "#000000";
    }
    return "#AAA";
  };

  const handleColourStroke = (country) => {
    const { ISO_A2 } = country.properties;
    return "#FFF";
  };

  const selectedCountryOptions = () => {
    return (
      <div>
        <h4>OPTIONS:</h4>
        <ul>
          <li>
            <button type="button"> ATTACK </button>
            <button type="button">MOVE</button>
            <button type="button">DONATE</button>
            <button type="button">DROP</button>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div>
      <div className="map-sidebar-wrapper">
        <div className="map-sidebar-info-wrapper">
          <div>
            <h1>START THE CONQUEST!</h1>
            <h2>Welcome Commander {username}!</h2>
          </div>
          <p>
            This is your war control room. Help us attain victory over our
            enemies. The Gods are on our side!
          </p>
          {clickedCountry !== "" && (
              <p>Selected Country: {clickedCountry}</p>
            ) && <selectedCountryOptions />}
          {display && <CountryDetails />}
        </div>
      </div>
      <MapSettings
        setTooltipContent={setState}
        setname={setname}
        setgdp={setgdp}
        setpop_est={setpop_est}
        setdisplay={setdisplay}
        setcontinent={setcontinent}
        setsubrg={setsubrg}
        setclickedCountry={handleclickedCountry}
        handleColourFill={handleColourFill}
        handleColourStroke={handleColourStroke}
        setdoubleClicked={handledoubleClicked}
      />
      <ReactTooltip>{state}</ReactTooltip>
    </div>
  );
}

const getnum = (num) => {
  var num = Math.round(num);
  if (num > Math.pow(10, 12)) {
    num = num / Math.pow(10, 12) + " Trillion";
  } else if (num > Math.pow(10, 9)) {
    num = num / Math.pow(10, 9) + " Billion";
  } else if (num > Math.pow(10, 6)) {
    num = num / Math.pow(10, 6) + " Million";
  }
  return num;
};

//Countries to not display
function notThisCountry(country) {
  const { NAME } = country.properties;
  return NAME !== "";
}

var clickedCountry;
//TODO: player team colour for country
function countryColors(country) {
  const { NAME, ISO_A2 } = country.properties;
  return "#AAA";
}

function loadMap() {
  const situation = document.cookie
    .split("; ")
    .map((s) => s.split("="))
    .filter((arr) => arr[0] == "situation")[0][1];
  const fileURL = "/maps/" + situation + ".txt";

  var countries = {};

  var raw = "";
  fetch(fileURL)
    .then((line) => line.text())
    .then((line) => line.split("\n"))
    .then((data) => (raw = data));

  console.log(raw);
  var borders = [];
  for (let i = 0; i < raw.length; i++) {
    borders = [];
    var line = raw[i].split(" ");
    countries[line[0]] = line.slice(1);
  }
  return countries;
}

function getBorder(countrycode) {
  return countries[countrycode];
}

//FIXME: fix read file correctly
function getCountryCodes(countrycode) {
  const fileURL = require("../maps/world.txt");
  const textByLine = fetch(fileURL)
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      const borderdata = data.split("\n").toString();
      // console.log(data.split("\n").toString());
      //
      var countriesBordering = [];
      //Processing
      for (let j = 0; j < borderdata.length; j++) {
        var borders = borderdata[j].split(" ");
        console.log(borders);
        if (borders[0] == countrycode) {
          for (let i = 1; i < borders.length; i++) {
            //Get border codes
            // console.log(borders[i]);
            countriesBordering.push(borders[i]);
          }
        }
      }
      // console.log(countriesBordering);
      return countriesBordering;
    });
  return textByLine;
}

/* GAME MAP */

const MapSettings = ({
  setTooltipContent,
  setname,
  setpop_est,
  setsubrg,
  setcontinent,
  setgdp,
  setdisplay,
  setclickedCountry,
  handleColourFill,
  handleColourStroke,
  setdoubleClicked,
}) => {
  return (
    <div className="map-wrapper">
      <ComposableMap data-tip="">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fillcolour = handleColourFill(geo);
                const strokecolour = handleColourStroke(geo);
                return notThisCountry(geo) ? (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillcolour}
                    stroke={strokecolour}
                    onMouseEnter={() => {
                      const {
                        NAME,
                        POP_EST,
                        GDP_MD_EST,
                        SUBREGION,
                        CONTINENT,
                      } = geo.properties;

                      // setTooltipContent(
                      //   `${NAME} - $${getnum(GDP_MD_EST * Math.pow(10, 6))}`
                      // );

                      setTooltipContent(`${NAME} - ENEMY TERRITORY`);
                      setname(NAME);
                      setpop_est(getnum(POP_EST));
                      setgdp(getnum(GDP_MD_EST * Math.pow(10, 6)));
                      setsubrg(SUBREGION);
                      setcontinent(CONTINENT);
                      setdisplay(true);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                      setdisplay(false);
                    }}
                    style={{
                      default: {
                        fill: "#D6D6DA",
                        outline: "none",
                      },
                      hover: {
                        fill: "#F53",
                        outline: "none",
                      },
                      pressed: {
                        fill: "#D6D6DA",
                        outline: "none",
                      },
                    }}
                    onClick={() => {
                      const { ISO_A2 } = geo.properties;
                      setclickedCountry(ISO_A2);
                    }}
                    onDoubleClick={() => {
                      setdoubleClicked();
                    }}
                  />
                ) : null;
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default GameMap;
