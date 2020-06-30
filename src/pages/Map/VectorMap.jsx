import React, { memo } from 'react';
import { ZoomableGroup, ComposableMap, Geographies, Geography, Marker, Annotation, Graticule } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import ReactTooltip from 'react-tooltip';

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const rounded = (num) => {
	num = Math.round(num);
	if (num > Math.pow(10, 12)) {
		num = num / Math.pow(10, 12) + ' Trillion';
	} else if (num > Math.pow(10, 9)) {
		num = num / Math.pow(10, 9) + ' Billion';
	} else if (num > Math.pow(10, 6)) {
		num = num / Math.pow(10, 6) + ' Million';
	}
	return num;
};

//Can I optimise?
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
    convertISO
}) => {
	return (
		<div>
			{/* <ComposableMap data-tip="" projectionConfig={{ scale: 200 }} width={mapWidth} height={mapHeight}> */}
			{/* <ZoomableGroup translateExtent={[ [ 0, -mapHeight ], [ mapWidth, mapHeight ] ]}> */}
            <ComposableMap data-tip="" /*projection="geoOrthographic"*/ projectionConfig={{ scale: 140 }}>
				<ZoomableGroup>
                    <Graticule stroke="#2e3131" />
					<Geographies geography={geoUrl}>
						{({ geographies }) =>
							geographies.map((geo) => {
								const fillcolor = handleColorFill(geo);
								return notThisCountry(geo) ? (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										fill={fillcolor}
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
										onClick={() => {
											handleClick(geo);
										}}
										style={{
											default: {
												outline: 'none'
											},
											hover: {
												fill: '#997f53',
												outline: 'none'
											}
										}}
									/>
								) : null;
							})}
					</Geographies>
					<Geographies geography={geoUrl}>
						{({ geographies }) =>
							geographies.map((geo) => {
                                const { NAME, ISO_A2 } = geo.properties;
                                var iso_a2 = convertISO(NAME, ISO_A2);
								return notThisCountry(geo) ? (
									<Marker coordinates={geoCentroid(geo)}>
										<text y="2" fontSize={3} textAnchor="middle" fill="#FF" style={{pointerEvents: 'none'}}>
											{countryStates !== undefined && iso_a2.toString() in countryStates ? (
												countryStates[iso_a2.toString()]['Troops']
											) : (
												0
											)}
										</text>
									</Marker>
								) : null;
							})}
					</Geographies>
				</ZoomableGroup>
			</ComposableMap>
		</div>
	);
};

const VectorMap = ({
	setname,
	setpop_est,
	setsubrg,
	setcontinent,
	setgdp,
	handleColorFill,
    handleClick,
    countryStates,
    convertISO
}) => {
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
				handleColorFill={handleColorFill}
                handleClick={handleClick}
                countryStates={countryStates}
                convertISO={convertISO}
			/>
			<ReactTooltip>{content}</ReactTooltip>
		</div>
	);
};

export default memo(VectorMap);
