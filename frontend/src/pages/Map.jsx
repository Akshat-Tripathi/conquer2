import React, { Component } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

//svgWorldMap

// const worldStates = require("frontend/src/pages/SVG-World-Map/src/world-states.svg");
// const worldStatesProvinces = require("frontend/src/pages/SVG-World-Map/src/world-states-provinces.svg");

const geoURL =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class MapDisplay extends Component {
  render() {
    return (
      <div>
        <ComposableMap>
          <Geographies geography={geoURL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>
    );
  }
}

export default MapDisplay;
