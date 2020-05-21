import React, { Component, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { useSpring, animated } from "react-spring";
import "./Map.css";
import { connect } from "../api/index.js";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

//NOTE: For API, please see src/api/index.js;

class GameMap extends Component {
  // componenetDidMount() {
  //   let socket = new WebSocket(socketURL);

  //   socket.onopen = () => {
  //     console.log("Connection Successful");
  //   };

  //   socket.onmessage = (msg) => {
  //     const message = JSON.parse(msg.data);
  //     console.log(msg);
  //   };

  //   socket.onclose = () => {
  //     console.log("Disconnected");
  //   };
  // }

  constructor() {
    super();
}

render() {
    connect();
    return <MapDisplay />;
  }
}

function MapDisplay() {
  return (
    <div>
      <SideBar />
    </div>
  );
}

//Variables for each country to display for Sidebar
var country;
var pop_est;
var gdp;
var subrg;
var continent;
var displayCountryDetails = false;
var troopsInLand;
var yourland;

const CountryDetails = (props) => {
  return (
    <div>
      <h2>Spy Report On {country}:</h2>
      <h3>Population: {pop_est}</h3>
      <h3>GDP: {gdp}</h3>
      <h3>Subregion: {subrg}</h3>
      <h3>Continent: {continent}</h3>
    </div>
  );
};

function SideBar() {
  const [state, setState] = useState("");
  const [spydata, setSpydata] = useState({
    Country: "",
    Population: "",
    GDP: "",
    Subregion: "",
    Continent: "",
  });
  return (
    <div>
      <div className="map-sidebar-wrapper">
        <div className="map-sidebar-info-wrapper">
          <h1>Welcome Commander!</h1>
          <p>
            This is your war control room. Help us attain victory over our
            enemies. The Gods are on our side!
          </p>
          {displayCountryDetails ? <CountryDetails /> : null}
        </div>
      </div>
      <MapSettings setTooltipContent={setState} setSpydata={setSpydata} />
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

const MapSettings = ({ setTooltipContent, setSpydata }) => {
  return (
    <div className="map-wrapper">
      <ComposableMap data-tip="">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#AAA"
                  stroke="#FFF"
                  onMouseEnter={() => {
                    const {
                      NAME,
                      POP_EST,
                      GDP_MD_EST,
                      SUBREGION,
                      CONTINENT,
                    } = geo.properties;
                    setTooltipContent(
                      `${NAME} - $${getnum(GDP_MD_EST * Math.pow(10, 6))}`
                    );
                    country = NAME;
                    pop_est = getnum(POP_EST);
                    gdp = getnum(GDP_MD_EST * Math.pow(10, 6));
                    subrg = SUBREGION;
                    continent = CONTINENT;
                    // setSpydata(NAME, POP_EST, GDP_MD_EST, SUBREGION, CONTINENT);
                    displayCountryDetails = true;
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                    // setSpydata("", "", "", "", "");
                    displayCountryDetails = false;
                  }}
                  onClick={() => {
                    const {
                      NAME,
                      POP_EST,
                      GDP_MD_EST,
                      SUBREGION,
                      CONTINENT,
                    } = geo.properties;
                    country = NAME;
                    pop_est = getnum(POP_EST);
                    gdp = getnum(GDP_MD_EST * Math.pow(10, 6));
                    subrg = SUBREGION;
                    continent = CONTINENT;
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
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default GameMap;
