import React, { Component, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import "./Map.css";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const id = "test/";
const socketURL = "ws://localhost:8080/game/" + id + "ws";

class GameMap extends Component {
  componenetDidMount() {
    let socket = new WebSocket(socketURL);

    socket.onopen = () => {
        console.log("Connection Successful");
    };
    
    socket.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        console.log(msg);
    };
    
    socket.onclose = () => {
        console.log("Disconnected");
    };
    
  }

  render() {
    return <MapDisplay />;
  }
}

function MapDisplay() {
  const [state, setState] = useState("");
  return (
    <div>
      <SideBar />
      <MapSettings setTooltipContent={setState} />
      <ReactTooltip>{state}</ReactTooltip>
    </div>
  );
}

function SideBar() {
  return (
    <div className="map-sidebar-wrapper">
      <div className="map-sidebar-info-wrapper">
        <h1>GameInfo</h1>
      </div>
    </div>
  );
}

const getWealth = (GDP_MD_EST, POP_EST) => {
  var actual_GDP = GDP_MD_EST * Math.pow(10, 6);
  var wealth = Math.round(actual_GDP);
  if (wealth > Math.pow(10, 12)) {
    wealth = wealth / Math.pow(10, 12) + " Trillion";
  } else if (wealth > Math.pow(10, 9)) {
    wealth = wealth / Math.pow(10, 9) + " Billion";
  } else if (wealth > Math.pow(10, 6)) {
    wealth = wealth / Math.pow(10, 6) + " Million";
  }
  return wealth;
};

const MapSettings = ({ setTooltipContent }) => {
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
                  fill="#DDD"
                  stroke="#FFF"
                  onMouseEnter={() => {
                    const { NAME, POP_EST, GDP_MD_EST } = geo.properties;
                    setTooltipContent(
                      `${NAME} - ${getWealth(GDP_MD_EST, POP_EST)}`
                    );
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  onClick={() => {}}
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
                      fill: "#E42",
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
