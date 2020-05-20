import React, { Component, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

function MapDisplay() {
  const [state, setState] = useState("");
  return (
    <div>
      <MapSettings setTooltipContent={setState} />
      <ReactTooltip>{state}</ReactTooltip>
    </div>
  );
}

const getWealth = (GDP_MD_EST, POP_EST) => {
  var wealth = Math.round(GDP_MD_EST);
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
    <div>
      <ComposableMap data-tip="">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const { NAME, POP_EST, GDP_MD_EST } = geo.properties;
                    setTooltipContent(
                      `${NAME} - ${getWealth(GDP_MD_EST, POP_EST)}`
                    );
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
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

export default MapDisplay;
