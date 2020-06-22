import React, { Component, useState } from 'react';
import './Map.css';
import { connect, loaddetails } from '../../api/index.js';
import { Typography, Paper, makeStyles, IconButton, Snackbar, Grid } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import HelpIcon from '@material-ui/icons/Help';
import MuiAlert from '@material-ui/lab/Alert';
import VectorMap from './VectorMap';

const username = 'Shashwat';

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

var countriesLoaded = false;
var countries = {};
var socket = null;
var troops = 0;
var countryStates = {};
var playerColours = {};
var players = [];

class countryState {
	constructor(Troops, Player) {
		this.Troops = Troops;
		this.Player = Player;
	}
}

class GameMap extends Component {
	// constructor() {
	// 	super();
	// 	socket = connect();
	// 	socket.onmessage = (msg) => {
	// 		var action = JSON.parse(msg.data);
	// 		switch (action.Type) {
	// 			case 'updateTroops':
	// 				troops = action.Troops;
	// 				break;
	// 			case 'updateCountry':
	// 				if (
	// 					typeof countryStates[action.Country] == 'undefined' ||
	// 					countryStates[action.Country].Player != action.Player
	// 				) {
	// 					countryStates[action.Country] = new countryState(action.Troops, action.Player);
	// 				} else {
	// 					countryStates[action.Country].Troops += action.Troops;
	// 				}
	// 				break;
	// 			case 'newPlayer':
	// 				console.log(action.Player + ' has entered the chat bois as: ' + action.Country);
	// 				playerColours[action.Player] = action.Country;
	// 				players.push(action.Player);
	// 		}
	// 	};
	// }

	render() {
		return <SideBar />;
	}
}

const useStyles = makeStyles((theme) => ({
	sidebarPaper: {
		marginLeft: '70%',
		marginTop: '10%',
		background: fade('#000000', 0.8),
		color: 'white',
		padding: theme.spacing(3),
		position: 'fixed',
		width: '30%',
		height: '80%',
		borderRadius: '5%',
		boxShadow: '0px 10px 50px #555'
	},
	buttons: {
		display: 'flex',
		justifyContent: 'flex-end'
	},
	button: {
		marginTop: theme.spacing(3),
		marginLeft: theme.spacing(1)
	}
}));

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SideBar() {
	const classes = useStyles();

	//Fetch #troops, attack, move options, fix data vals
	//TODO: Import username from entry form
	const [ name, setname ] = useState('Shashwat');
	const [ pop_est, setpop_est ] = useState('');
	const [ gdp, setgdp ] = useState('');
	const [ subrg, setsubrg ] = useState('');
	const [ continent, setcontinent ] = useState('');
	const [ display, setdisplay ] = useState(false);
	const [ clickedCountry, setclickedCountry ] = useState('');
	//For the snackbar display settings
	const [ openHelp, setOpenHelp ] = React.useState(false);

	const handleclickedCountry = (ISO_A2) => {
		setclickedCountry(ISO_A2);
	};

	const handledoubleClicked = () => {
		setclickedCountry('');
	};

	const handleOpenHelp = () => {
		setOpenHelp(true);
	};

	const handleCloseHelp = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenHelp(false);
	};

	const CountryDetails = () => {
		return (
			<div>
				<h2>Spy Report On {name}:</h2>
				<h3>{countryStates[clickedCountry].Troops !== undefined && countryStates[clickedCountry].Troops}</h3>
				<h3>Population: {pop_est}</h3>
				<h3>GDP (PPP): {gdp}</h3>
				{continent !== 'South America' && <h3>Subregion: {subrg}</h3>}
				<h3>Continent: {continent}</h3>
				<h3>Allegiance: Ohio</h3>
			</div>
		);
	};

	const handleColourFill = (country) => {
		if (!countriesLoaded) {
			loadMap();
			countriesLoaded = true;
		}
		const { ISO_A2 } = country.properties;

		if (
			clickedCountry !== '' &&
			countries[clickedCountry] !== undefined &&
			countries[clickedCountry].some((iso) => iso === ISO_A2)
		) {
			return '#be90d4';
		}
		try {
			var col = playerColours[countryStates[ISO_A2].Player];
			if (typeof col == 'undefined') {
				col = '#B9A37E';
			}
			return col;
		} catch (TypeError) {
			return '#B9A37E';
		}
	};

	const options = () => {
		return (
			<div>
				<button>ATTACK</button>
				<button>MOVE</button>
				<button>DONATE</button>
				<button>DEPLOY</button>
			</div>
		);
	};

	const PlayerBox = () => {
		return (
			<div>
				<Paper>
					<Typography variant="subtitle1">PLAYERS:</Typography>
					<ul>{players.map((p) => <li key={p}>p</li>)}</ul>
				</Paper>
			</div>
		);
	};

	return (
		<div>
			<Paper class={classes.sidebarPaper}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={10}>
						<Typography variant="h4">Welcome, Commander {name}!</Typography>
					</Grid>
					<Grid item xs={12} sm={2}>
						<IconButton aria-label="help" color="primary" size="small">
							<HelpIcon
								style={{
									fontSize: '25'
								}}
								onClick={handleOpenHelp}
							/>
							<Snackbar open={openHelp} autoHideDuration={10000} onClose={handleCloseHelp}>
								<Alert onClose={handleCloseHelp} severity="info">
									This is your control room. Hover above countries to communicate with your spies.
								</Alert>
							</Snackbar>
						</IconButton>
					</Grid>
				</Grid>
			</Paper>

			{/* <PlayerBox />
			<div className="map-sidebar-wrapper">
				<div className="map-sidebar-info-wrapper">
					<h1>START THE CONQUEST!</h1>
					<Typography variant="h4">Welcome Commander {username}!</Typography>
					<br />
					<br />
					<Typography variant="subtitle1">BASE TROOPS: {troops}</Typography>
					<p>
						This is your war control room. Help us attain victory over our enemies. The Gods are on our
						side!
					</p>
					{clickedCountry !== '' && <selectedCountryOptions />}
					{display && <CountryDetails />}
				</div>
			</div> */}
			<VectorMap />
		</div>
	);
}

var clickedCountry;
//TODO: player team colour for country
function countryColors(country) {
	const { NAME, ISO_A2 } = country.properties;
	return '#AAA';
}

function loadMap() {
	//TODO: take value from the cookie
	fetch('/maps/world.txt')
		.then((raw) => raw.text())
		.then((raw) => raw.split('\n'))
		.then((lines) => lines.map((s) => s.split(' ')))
		.then((lines) => lines.forEach((line) => (countries[line[0]] = line.slice(1))));
}

//FIXME: fix read file correctly
function getCountryCodes(countrycode) {
	// var fs = require("fs");
	const fileURL = '/maps/world.txt';
	var textByLine = '';
	fetch(fileURL)
		.then((raw) => raw.text())
		.then((raw) => raw.split('\n'))
		.then((raw) => raw.map((x) => x.split(' ')))
		.then((raw) => (textByLine = raw));

	var countriesBordering = [];

	for (let j = 0; j < textByLine.length; j++) {
		var borders = textByLine[j].split(' ');
		if (borders[0] == countrycode) {
			for (let i = 1; i < borders.length; i++) {
				//Get border codes
				countriesBordering.push(borders[i]);
			}
		}
	}
	console.log(countriesBordering);
	return countriesBordering;
}

/* GAME MAP */

// const MapSettings = ({
// 	setTooltipContent,
// 	setname,
// 	setpop_est,
// 	setsubrg,
// 	setcontinent,
// 	setgdp,
// 	setdisplay,
// 	setclickedCountry,
// 	handleColourFill,
// 	handleColourStroke,
// 	setdoubleClicked
// }) => {
// 	return (
// 		<div className="map-wrapper">
// 			<ComposableMap>
// 				<CustomZoomableGroup center={[ 0, 0 ]}>
// 					{(position) => (
// 						<div>
// 							<Geographies geography={geoUrl}>
// 								{({ geographies }) => (
// 									<div>
// 										{geographies.map((geo) => {
// 											const fillcolour = handleColourFill(geo);
// 											const strokecolour = handleColourStroke(geo);
// 											return notThisCountry(geo) ? (
// 												<Geography
// 													key={geo.rsmKey}
// 													geography={geo}
// 													fill={fillcolour}
// 													stroke={strokecolour}
// 													onMouseEnter={() => {
// 														const {
// 															NAME,
// 															POP_EST,
// 															GDP_MD_EST,
// 															SUBREGION,
// 															CONTINENT
// 														} = geo.properties;

// 														// setTooltipContent(
// 														//   `${NAME} - $${getnum(GDP_MD_EST * Math.pow(10, 6))}`
// 														// );

// 														setTooltipContent(`${NAME} - ENEMY TERRITORY`);
// 														setname(NAME);
// 														setpop_est(getnum(POP_EST));
// 														setgdp(getnum(GDP_MD_EST * Math.pow(10, 6)));
// 														setsubrg(SUBREGION);
// 														setcontinent(CONTINENT);
// 														setdisplay(true);
// 													}}
// 													onMouseLeave={() => {
// 														setTooltipContent('');
// 														setdisplay(false);
// 													}}
// 													style={{
// 														default: {
// 															fill: '#D6D6DA',
// 															outline: 'none'
// 														},
// 														hover: {
// 															fill: '#F53',
// 															outline: 'none'
// 														},
// 														pressed: {
// 															fill: '#D6D6DA',
// 															outline: 'none'
// 														}
// 													}}
// 													onClick={() => {
// 														const { ISO_A2 } = geo.properties;
// 														setclickedCountry(ISO_A2);
// 													}}
// 													onDoubleClick={() => {
// 														setdoubleClicked();
// 													}}
// 												/>
// 											) : null;
// 										})}

// 										{geographies.map((geo) => {
// 											const centroid = geoCentroid(geo);
// 											const { ISO_A2 } = geo.properties;
// 											return (
// 												<g key={geo.rsmKey}>
// 													{
// 														<Marker coordinates={centroid}>
// 															<text fontSize={7 / position.k} alignmentBaseline="middle">
// 																{countries[ISO_A2]}
// 															</text>
// 														</Marker>
// 													}
// 												</g>
// 											);
// 										})}
// 									</div>
// 								)}
// 							</Geographies>
// 						</div>
// 					)}
// 				</CustomZoomableGroup>
// 			</ComposableMap>
// 		</div>
// 	);
// };

export default SideBar;
