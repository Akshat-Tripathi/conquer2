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

class GameMap extends Component {
  constructor() {
    super();
    connect();
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
      getCountryCodes(clickedCountry).includes(ISO_A2) &&
      clickedCountry !== ""
    ) {
      return "#000";
    }
    return "#FFF";
  };

  const handleclickedCountry = (ISO_A2) => {
    if (clickedCountry === "") {
      setclickedCountry(ISO_A2);
    } else {
      setclickedCountry("");
    }
  };

  const handleColourStroke = (country) => {
    const { ISO_A2 } = country.properties;
    return "#FFF";
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
          <p>
            {/* {loaddetails.map((detail) => {
              console.log(detail);
            })} */}
          </p>
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

//FIXME: fix read file correctly
function getCountryCodes(countrycode) {
  // var fs = require("fs");
  const fileURL = "../maps/world.txt";
  var textByLine = fs
    .readFileSync("../../../maps/world.txt")
    .toString()
    .split("\n");

  var countriesBordering = [];

  for (let j = 0; j < textByLine.length; j++) {
    var borders = textByLine[j].split(" ");
    if (borders[0] == countrycode) {
      for (let i = 1; i < borders.length; i++) {
        //Get border codes
        countriesBordering.push(borders[i]);
      }
    }
  }
  return countriesBordering;
}

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
}) => {
  return (
    <div className="map-wrapper">
      <ComposableMap data-tip="">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) =>
                notThisCountry(geo) ? (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={handleColourFill(geo)}
                    stroke={handleColourStroke(geo)}
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
                  />
                ) : null
              )
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default GameMap;
