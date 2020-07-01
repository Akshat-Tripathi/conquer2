import React, { Component } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Paper, Typography } from "@material-ui/core";
import "./Map.css";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

function InfoTab() {
  return (
    <div className="info-tab">
      <Paper elevation={10}>
        <div>
          <h3>InfoChart</h3>
        </div>
      </Paper>
    </div>
  );
}

export const MapDisplay = () => (
  <div>
    <ComposableMap>
      <ZoomableGroup zoom={1}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                // fill="#DDD"
                // stroke="#DDD"
              />
            ))
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
    <InfoTab />
  </div>
);

// const MapSVG = () => (

// );
