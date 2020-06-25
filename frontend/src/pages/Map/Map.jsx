import React, { Component, useState } from 'react';
import { connect, loaddetails } from '../../api/index.js';
import {
	Typography,
	Paper,
	makeStyles,
	IconButton,
	Snackbar,
	Grid,
	Button,
	Select,
	MenuItem,
	FormHelperText,
	FormControl
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import HelpIcon from '@material-ui/icons/Help';
import MuiAlert from '@material-ui/lab/Alert';
import VectorMap from './VectorMap';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
//FIXME: Username not being imported - has no val??
// import { username } from '../Home/StartGameBox';
import './Map.css';
import { Options, OptionsDeploy, DonateForm } from './ActionButtons';

// ISO_A2 of source country
var fromCountryISO = '';
// ISO_A2 of dest country
var toCountryISO = '';
// List of ALL countries
var countries = {};
// Socket value
var socket = null;
// Number of troops in current player's base
var troops = 0;
// List of all countries
var countryStates = {};
// List of all 'players: colours'
var playerColours = {};
// List of all players
var players = [];
// List of this player's countries
var playerCountries = [];
// Current player name
var user = '';
// Number of troops for actions (e.g. donate)
// var numTroops = 0;

class countryState {
	constructor(Troops, Player) {
		this.Troops = Troops;
		this.Player = Player;
	}
}

// class GameMap extends Component {
// 	constructor() {
// 		super();
// 		socket = connect();
// 		socket.onmessage = (msg) => {
// 			var action = JSON.parse(msg.data);
// 			switch (action.Type) {
// 				case 'updateTroops':
// 					user = action.Player;
// 					troops += action.Troops;
// 					break;
// 				case 'updateCountry':
// 					if (
// 						typeof countryStates[action.Country] == 'undefined' ||
// 						countryStates[action.Country].Player != action.Player
// 					) {
// 						if (action.Player == user) {
// 							console.log(user);
// 							playerCountries.push(action.Country);
// 						}
// 						if (countryStates[action.Country] == user) {
// 							playerCountries.filter((country) => country != action.Country);
// 						}
// 						countryStates[action.Country] = new countryState(action.Troops, action.Player);
// 					} else {
// 						countryStates[action.Country].Troops += action.Troops;
// 					}
// 					break;
// 				case 'newPlayer':
// 					console.log(action.Player + ' has entered the chat bois as: ' + action.Country);
// 					playerColours[action.Player] = action.Country;
// 					players.push(action.Player);
// 			}
// 		};
// 	}

// 	render() {
// 		return <SideBar />;
// 	}
// }

const useStyles = makeStyles((theme) => ({
	sidebar: {
		marginLeft: '70%',
		marginTop: '10%',
		background: fade('#000000', 0.8),
		color: 'white',
		padding: theme.spacing(2),
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
	},
	input: {
		minWidth: 120,
		marginRight: theme.spacing(2)
	},
	select: {
		borderWidth: '1px',
		borderColor: 'yellow'
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

	//Load up map initially
	const [ countriesLoaded, setcountriesLoaded ] = useState(false);

	//Show Deployment option?
	const [ allowDeploy, setallowDeploy ] = useState(false);

	//Show Move option?
	const [ allowMove, setallowMove ] = useState(false);

	//Show drop downs?
	const [ showDonate, setshowDonate ] = useState(false);
	const [ showAssist, setshowAssist ] = useState(false);
	const [ showMove, setshowMove ] = useState(false);
	//For sending socket message actions (e.g. donate)
	const [ targetPlayer, settargetPlayer ] = useState('');
	const [ numTroops, setnumTroops ] = useState(0);

	const handleClick = (geo) => {
		const { NAME, ISO_A2 } = geo.properties;

		if (fromCountry === '') {
			if (playerCountries.some((iso) => iso === ISO_A2)) {
				fromCountryISO = ISO_A2;

				setfromCountry(NAME);
				setallowDeploy(true);
			}
		} else if (NAME === fromCountry) {
			toCountryISO = '';
			fromCountryISO = '';
			setfromCountry('');
			settoCountry('');
			setallowDeploy(false);
			setallowMove(false);
		} else {
			//TODO: Is own country: Enable Move
			//TODO: Another country: Enable attack/assist
			console.log(playerCountries);
			// TODO: Check if neighbouring country
			// if (countries[fromCountryISO].some((iso) => iso === ISO_A2)) {
			// }
			setallowDeploy(false);
			settoCountry(NAME);
			toCountryISO = ISO_A2;
			//TODO: Add if statements
			// IF own country
			if (playerCountries.some((iso) => iso === ISO_A2)) {
				setallowMove(true);
			} else {
				setallowMove(false);
			}
			//ELSE
			console.log(toCountry);
		}
	};

	//Handle functions for snackbar
	const handleOpenHelp = () => {
		setOpenHelp(true);
	};

	const handleDonate = () => {
		setshowDonate(!showDonate);
		if (!showDonate) {
			setnumTroops(0);
		}
	};

	const handleAssist = () => {
		setshowAssist(!showAssist);
		if (!showAssist) {
			setnumTroops(0);
		}
	};

	const handleMove = () => {
		setshowMove(!showMove);
		if (!showMove) {
			setnumTroops(0);
		}
	};

	const handleCloseHelp = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenHelp(false);
	};

	//FIXME: Use useState hook here to avoid lag ?
	const handleNumTroops = (event) => {
		setnumTroops(event.target.value);
	};

	const handletargetPlayer = (event) => {
		settargetPlayer(event.target.value);
	};

	const handleColorFill = (geo) => {
		if (!countriesLoaded) {
			loadMap();
			setcountriesLoaded(true);
		}

		const { ISO_A2 } = geo.properties;

		// if (NAME === fromCountry) {
		// 	return '#002984';
		// } else if (NAME === toCountry) {
		// 	return '#ffcd38';
		// }

		if (
			fromCountryISO !== '' &&
			countries[fromCountryISO] !== undefined &&
			countries[fromCountryISO].some((iso) => iso === ISO_A2)
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
		const { NAME, ISO_A2 } = geo.properties;
		if (NAME === fromCountry) {
			return '#002984';
		} else if (NAME === toCountry) {
			return '#ff9800';
		}
		try {
			var col = playerColours[countryStates[ISO_A2].Player];
			if (typeof col == 'undefined') {
				col = '#B9A37E';
			}
			return col;
		} catch (TypeError) {
			col = '#B9A37E';
		}
	};

	const handleStrokeWidth = (geo) => {
		const { NAME } = geo.properties;
		if (NAME === fromCountry || NAME === toCountry) {
			return 2;
		}
		return 0.3;
	};

	return (
		<div>
			{players.length !== 0 && <PlayerBox classes={classes} />}
			<Paper className={classes.sidebar}>
				<Grid container style={{ alignText: 'center' }}>
					<Title
						username={user}
						handleCloseHelp={handleCloseHelp}
						handleOpenHelp={handleOpenHelp}
						openHelp={openHelp}
					/>
					{/* Show Donation options when clicked on Donate Button */}
					{fromCountry === '' && (
						<DonateForm
							classes={classes}
							handleDonate={handleDonate}
							handletargetPlayer={handletargetPlayer}
							handleNumTroops={handleNumTroops}
							showDonate={showDonate}
							numTroops={numTroops}
							targetPlayer={targetPlayer}
						/>
					)}

					{/* Only show Attack and Donate options when two countries clicked */}
					{toCountry !== '' && (
						<Grid item xs={12}>
							<Options
								classes={classes}
								toCountry={toCountry}
								fromCountry={fromCountry}
								allowMove={allowMove}
								handleNumTroops={handleNumTroops}
								handleAssist={handleAssist}
								handleMove={handleMove}
								showMove={showMove}
								showAssist={showAssist}
							/>
						</Grid>
					)}

					{/* Deploy troops from base to country */}
					{allowDeploy && (
						<OptionsDeploy
							classes={classes}
							numTroops={numTroops}
							handleNumTroops={handleNumTroops}
							fromCountry={fromCountry}
						/>
					)}

					{/* Only Show SpyDetails when not clicked anything */}
					<Grid item xs={12}>
						{fromCountry === '' &&
							(name !== '' && (
								<SpyDetails
									name={name}
									subrg={subrg}
									continent={continent}
									pop_est={pop_est}
									gdp={gdp}
								/>
							))}
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

const Title = ({ handleCloseHelp, handleOpenHelp, openHelp }) => {
	return (
		<div>
			<IconButton aria-label="help" color="primary" size="small">
				<HelpIcon
					style={{
						fontSize: '20'
					}}
					onClick={handleOpenHelp}
				/>
				<Snackbar open={openHelp} autoHideDuration={5000} onClose={handleCloseHelp}>
					<Alert onClose={handleCloseHelp} severity="info">
						This is your control room. Hover above countries to receive encrypted data. Click on countries
						to see your military options.
					</Alert>
				</Snackbar>
			</IconButton>
			<Grid item xs={12}>
				<Typography variant="h4" align="center">
					Welcome, Commander {user}!
				</Typography>
			</Grid>
			<br />
			<Grid item xs={12}>
				<Typography variant="h6" align="center">
					Base Troops: {troops}
				</Typography>
			</Grid>
			<br />
		</div>
	);
};

//FIXME: Colour appearing not correct?
const PlayerBox = ({ classes }) => {
	return (
		<div>
			<Paper className={classes.players}>
				<Typography variant="subtitle1">PLAYERS:</Typography>
				<Grid container spacing={12}>
					{Object.keys(playerColours).map(function(player) {
						var colour = playerColours[player];
						return (
							<div key={player} style={{ padding: '5%' }}>
								<Grid container spacing={12}>
									<Grid item xs={12}>
										<Typography variant="p">{player}</Typography>
										<FiberManualRecordIcon style={{ color: colour }} />
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

function loadMap() {
	fetch('/maps/world.txt')
		.then((raw) => raw.text())
		.then((raw) => raw.split('\r\n'))
		.then((lines) => lines.map((s) => s.split(' ')))
		.then((lines) =>
			lines.forEach((line) => {
				countries[line[0]] = line.slice(1);
				/*console.log(line[0]);
				console.log(countries[line[0]]);*/
			})
		);
}

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
export { players, fromCountryISO, toCountryISO, user, socket };
