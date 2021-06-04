import React, { memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  Graticule,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import { GameContext } from "./Map";

// const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const rounded = (num) => {
  num = Math.round(num);
  if (num > Math.pow(10, 12)) {
    num = num / Math.pow(10, 12) + " Trn";
  } else if (num > Math.pow(10, 9)) {
    num = num / Math.pow(10, 9) + " Bil";
  } else if (num > Math.pow(10, 6)) {
    num = num / Math.pow(10, 6) + " Mil";
  }
  return num;
};

// Remove a particular country in the map by setting it to false
function notThisCountry(geo) {
  // const { NAME } = geo.properties;
  // return NAME !== '';
  return true;
}

const MapChart = ({
  setTooltipContent,
  setname,
  setpop_est,
  setsubrg,
  setcontinent,
  setgdp,
  handleColorFill,
  handleClick,
  countryStates,
  convertISO,
  hideUnrelated,
  isUnrelated,
  gamemap,
}) => {
  return (
    <div>
      {/* <ComposableMap data-tip="" projectionConfig={{ scale: 200 }} width={mapWidth} height={mapHeight}> */}
      {/* <ZoomableGroup translateExtent={[ [ 0, -mapHeight ], [ mapWidth, mapHeight ] ]}> */}
      <ComposableMap
        data-tip=""
        /*projection="geoOrthographic"*/ projectionConfig={{ scale: 140 }}
      >
        <ZoomableGroup>
          <Graticule stroke="#2e3131" />
          <Geographies geography={gamemap}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fillcolor = handleColorFill(geo);
                return notThisCountry(geo) ? (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillcolor}
                    onMouseEnter={() => {
                      const {
                        NAME,
                        POP_EST,
                        SUBREGION,
                        CONTINENT,
                        GDP_MD_EST,
                      } = geo.properties;
                      setTooltipContent(`${NAME}`);
                      setname(NAME);
                      setpop_est(rounded(POP_EST));
                      setcontinent(CONTINENT);
                      setgdp(rounded(GDP_MD_EST * 1000));
                      setsubrg(SUBREGION);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                      setname("");
                      setpop_est("");
                      setcontinent("");
                      setgdp();
                      setsubrg("");
                    }}
                    onClick={() => {
                      handleClick(geo);
                    }}
                    style={{
                      default: {
                        outline: "none",
                      },
                      hover: {
                        fill: "#997f53",
                        outline: "none",
                      },
                    }}
                  />
                ) : null;
              })
            }
          </Geographies>
          <Geographies geography={gamemap}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const { NAME, ISO_A2 } = geo.properties;
                var iso_a2 = convertISO(NAME, ISO_A2);
                const centroid = geoCentroid(geo);
                return !(hideUnrelated && isUnrelated(iso_a2)) ? (
                  <Marker
                    coordinates={[
                      centroid[0] + OffsetsX(NAME),
                      centroid[1] + OffsetsY(NAME),
                    ]}
                    key={`${NAME}_${ISO_A2}_marker`}
                  >
                    <text
                      y="2"
                      fontSize={3}
                      textAnchor="middle"
                      fill="#FF"
                      style={{ pointerEvents: "none" }}
                    >
                      {countryStates !== undefined &&
                      iso_a2.toString() in countryStates
                        ? countryStates[iso_a2.toString()]["Troops"]
                        : 0}
                    </text>
                  </Marker>
                ) : null;
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

// France 		[9,4]
// Indonesia 	[-4,2]
// Malaysia 	[-7,0]
// Antarctica 	[-30,8]
// United Kingdom [2,0]

function OffsetsX(NAME) {
  switch (NAME) {
    case "France":
      return 9;
    case "Indonesia":
      return -4;
    case "Malaysia":
      return -7;
    case "Antarctica":
      return -30;
    case "United Kingdom":
      return 2;
    case "Canada":
      return -8;
    case "United States of America":
      return 4;
    default:
      return 0;
  }
}

function OffsetsY(NAME) {
  switch (NAME) {
    case "France":
      return 4;
    case "Indonesia":
      return 2;
    case "Antarctica":
      return 8;
    case "United States of America":
      return -6;
    case "Canada":
      return -6;
    default:
      return 0;
  }
}

const VectorMap = ({
  setname,
  setpop_est,
  setsubrg,
  setcontinent,
  setgdp,
  handleColorFill,
  handleClick,
  countryStates,
  convertISO,
  hideUnrelated,
  isUnrelated,
}) => {
  const [content, setContent] = React.useState("");
  const mapWidth = 1000;
  const mapHeight = 600;
  const gamemap = handleGameMap();
  return (
    <div>
      <MapChart
        setTooltipContent={setContent}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
        setname={setname}
        setpop_est={setpop_est}
        setsubrg={setsubrg}
        setcontinent={setcontinent}
        setgdp={setgdp}
        handleColorFill={handleColorFill}
        handleClick={handleClick}
        countryStates={countryStates}
        convertISO={convertISO}
        hideUnrelated={hideUnrelated}
        isUnrelated={isUnrelated}
        gamemap={gamemap}
      />
      <ReactTooltip>{content}</ReactTooltip>
    </div>
  );
};

const handleGameMap = () => {
  // switch (GameContext.gamemap) {
  // 	case 'world':
  // 		return 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';
  // }
  return "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
};

export default memo(VectorMap);
