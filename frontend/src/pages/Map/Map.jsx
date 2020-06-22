import React, { Component, useState } from 'react';
import { connect, loaddetails } from '../../api/index.js';
import { Typography, Paper, makeStyles, IconButton, Snackbar, Grid } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import HelpIcon from '@material-ui/icons/Help';
import MuiAlert from '@material-ui/lab/Alert';
import VectorMap from './VectorMap';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import './Map.css';

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
	sidebar: {
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
	players: {
		background: fade('#000000', 0.8),
		color: 'white',
		padding: theme.spacing(2),
		position: 'fixed',
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
	//CSS
	const classes = useStyles();

	//TODO: Fetch #troops, attack, move options, fix data vals

	// Spy Detail Information
	const [ name, setname ] = useState('');
	const [ pop_est, setpop_est ] = useState('');
	const [ gdp, setgdp ] = useState('');
	const [ subrg, setsubrg ] = useState('');
	const [ continent, setcontinent ] = useState('');

	//Currently Clicked Countries
	const [ fromCountry, setfromCountry ] = useState('');
	const [ toCountry, settoCountry ] = useState('');

	//For the snackbar display settings
	const [ openHelp, setOpenHelp ] = React.useState(false);

	//Get username
	const username = countryState.Player;

	const handleClick = (geo) => {
		const { NAME } = geo.properties;

		//TODO: Check if country1 is player's country
		if (fromCountry === '') {
			setfromCountry(NAME);
		} else if (NAME === fromCountry) {
			setfromCountry('');
			settoCountry('');
		} else {
			settoCountry(NAME);
		}
	};

	//Handle functions for snackbar
	const handleOpenHelp = () => {
		setOpenHelp(true);
	};

	const handleCloseHelp = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenHelp(false);
	};

	const handleColorFill = (country) => {
		if (!countriesLoaded) {
			loadMap();
			countriesLoaded = true;
		}
		const { NAME, ISO_A2 } = country.properties;

		if (NAME === fromCountry) {
			return '#002984';
		} else if (NAME === toCountry) {
			return '#ffcd38';
		}

		if (fromCountry === ISO_A2)
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

	//TODO: Change stroke according to action
	const handleColorStroke = (geo) => {
		const { NAME } = geo.properties;

		if (NAME === fromCountry) {
			return '#002984';
		} else if (NAME === toCountry) {
			return '#ff9800';
		}

		return '#FFFFFF';
	};

	const handleStrokeWidth = (geo) => {
		const { NAME } = geo.properties;

		if (NAME === fromCountry || NAME === toCountry) {
			return 1;
		}
		return 0.3;
	};

	const options = () => {
		return (
			<div>
				<Grid container xs={12}>
					<Grid item xs={12}>
						<button>ATTACK</button>
					</Grid>
					<Grid item xs={12}>
						<button>MOVE</button>
					</Grid>
					<Grid item xs={12}>
						<button>DONATE</button>
					</Grid>
					<Grid item xs={12}>
						<button>DEPLOY</button>
					</Grid>
				</Grid>
			</div>
		);
	};

	return (
		<div>
			{players.length !== 0 && <PlayerBox classes={classes} />}
			<Paper className={classes.sidebar}>
				<Grid container spacing={2} style={{ alignText: 'center' }}>
					<Grid item xs={12} sm={10}>
						<Typography variant="h4" align="center">
							Welcome, Commander {username}!
						</Typography>
					</Grid>
					<Grid item xs={12} sm={2}>
						<IconButton aria-label="help" color="primary" size="small">
							<HelpIcon
								style={{
									fontSize: '25'
								}}
								onClick={handleOpenHelp}
							/>
							<Snackbar open={openHelp} autoHideDuration={5000} onClose={handleCloseHelp}>
								<Alert onClose={handleCloseHelp} severity="info">
									This is your control room. Hover above countries to receive encrypted data. Click on
									countries to see your military options.
								</Alert>
							</Snackbar>
						</IconButton>
					</Grid>
					<Grid item xs={12}>
						{name !== '' && (
							<SpyDetails name={name} subrg={subrg} continent={continent} pop_est={pop_est} gdp={gdp} />
						)}
					</Grid>
				</Grid>
			</Paper>

			<VectorMap
				setname={setname}
				setpop_est={setpop_est}
				setsubrg={setsubrg}
				setcontinent={setcontinent}
				setgdp={setgdp}
				handleColorFill={handleColorFill}
				handleColorStroke={handleColorStroke}
				handleStrokeWidth={handleStrokeWidth}
				handleClick={handleClick}
			/>
		</div>
	);
}

const PlayerBox = ({ classes }) => {
	return (
		<div>
			<Paper className={classes.players}>
				<Typography variant="subtitle1">ONLINE PLAYERS:</Typography>
				<Grid container spacing={12}>
					{Object.keys(playerColours).map(function(player, color) {
						return (
							<div key={player} style={{ padding: '5%' }}>
								<Grid container spacing={12}>
									<Grid item xs={12}>
										<Typography variant="p">{player}</Typography>
										<FiberManualRecordIcon style={{ color: color }} />
									</Grid>
								</Grid>
							</div>
						);
					})}
				</Grid>
			</Paper>
		</div>
	);
};

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

const SpyDetails = ({ name, pop_est, gdp, continent, subrg }) => {
	return (
		<div>
			<Grid container spacing={12}>
				<Grid item xs={12} style={{ alignText: 'center' }}>
					<h2>
						Spy Report On: <div style={{ color: 'yellow' }}>{name}</div>
					</h2>
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>Population: </h3>
					<Typography variant="subtitle1">{pop_est} </Typography>
					{/* <h3>{countryStates[clickedCountry].Troops 
							!== undefined && countryStates[clickedCountry].Troops}</h3> */}
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>GDP (PPP): </h3>

					<Typography variant="subtitle1">{gdp} </Typography>
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>Continent</h3>
					<Typography variant="subtitle1">{continent} </Typography>
				</Grid>
				<Grid item xs={12} sm={6}>
					{continent !== 'South America' && (
						<div>
							<h3>Subregion: </h3>
							<Typography variant="subtitle1">{subrg} </Typography>
						</div>
					)}
				</Grid>
				<Grid item xs={12}>
					<h3>Allegiance: </h3>
					<Typography variant="subtitle1">Ohio </Typography>
				</Grid>
			</Grid>
		</div>
	);
};

export default SideBar;
