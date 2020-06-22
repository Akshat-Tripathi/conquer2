import React, { memo } from 'react';
import { ZoomableGroup, ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import ReactTooltip from 'react-tooltip';

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const rounded = (num) => {
	var num = Math.round(num);
	if (num > Math.pow(10, 12)) {
		num = num / Math.pow(10, 12) + ' Trillion';
	} else if (num > Math.pow(10, 9)) {
		num = num / Math.pow(10, 9) + ' Billion';
	} else if (num > Math.pow(10, 6)) {
		num = num / Math.pow(10, 6) + ' Million';
	}
	return num;
};

function notThisCountry(country) {
	const { NAME } = country.properties;
	// return NAME !== '';
	return true;
}

const MapChart = ({ setTooltipContent, setname, setpop_est, setsubrg, setcontinent, setgdp }) => {
	return (
		<div>
			{/* <ComposableMap data-tip="" projectionConfig={{ scale: 200 }} width={mapWidth} height={mapHeight}> */}
			{/* <ZoomableGroup translateExtent={[ [ 0, -mapHeight ], [ mapWidth, mapHeight ] ]}> */}
			<ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
				<ZoomableGroup>
					<Geographies geography={geoUrl}>
						{({ geographies }) =>
							geographies.map((geo) => {
								const centroid = geoCentroid(geo);
								return notThisCountry(geo) ? (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										stroke="#FFF"
										strokeWidth={0.3}
										onMouseEnter={() => {
											const { NAME, POP_EST, SUBREGION, CONTINENT, GDP_MD_EST } = geo.properties;
											setTooltipContent(`${NAME}`);
											setname(NAME);
											setpop_est(rounded(POP_EST));
											setcontinent(CONTINENT);
											setgdp(rounded(GDP_MD_EST * 1000));
											setsubrg(SUBREGION);
										}}
										onMouseLeave={() => {
											setTooltipContent('');
											setname('');
											setpop_est('');
											setcontinent('');
											setgdp();
											setsubrg('');
										}}
										style={{
											default: {
												fill: '#D6D6DA',
												outline: 'none'
											},
											hover: {
												fill: '#F53',
												outline: 'none'
											},
											pressed: {
												fill: '#',
												outline: 'none'
											}
										}}
									/>
								) : null;
							})}
					</Geographies>
				</ZoomableGroup>
			</ComposableMap>
		</div>
	);
};

const VectorMap = ({ setname, setpop_est, setsubrg, setcontinent, setgdp }) => {
	const [ content, setContent ] = React.useState('');
	const mapWidth = 1000;
	const mapHeight = 600;
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
			/>
			<ReactTooltip>{content}</ReactTooltip>
		</div>
	);
};

export default memo(VectorMap);
