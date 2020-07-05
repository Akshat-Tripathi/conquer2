import React, { Component, useState } from 'react';
import { connect, loaddetails } from '../../websockets/index.js';
import { Paper, makeStyles, Grid } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import VectorMap from './VectorMap';
import './Map.css';
import { Options, OptionsDeploy, DonateForm } from './ActionButtons';
import { SpyDetails, PlayerBox, Title } from './Texts';
import { useHotkeys } from 'react-hotkeys-hook';

class countryState {
	constructor(Troops, Player) {
		this.Troops = Troops;
		this.Player = Player;
	}
}

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

//PRE: A hex colour of the format #______ and a percentage p (0 < p < 1)
//POST: The hex colour, p% darker
function darken(hex, p) {
	const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - p));
	const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - p));
	const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - p));
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class GameMap extends Component {
	constructor() {
		super();
        socket = connect();
        var keepAlive = keepAlive = window.setInterval(() => {
            socket.send("{}");
        }, 54 * 1000);
		socket.onmessage = (msg) => {
            var action = JSON.parse(msg.data);
            window.clearInterval(keepAlive);
            keepAlive = window.setInterval(() => {
                socket.send("{}");
            }, 54 * 1000);
			switch (action.Type) {
				case 'updateTroops':
					console.log(action);
					user = action.Player;
					troops += action.Troops;
					break;
				case 'updateCountry':
					let ok = typeof countryStates[action.Country] === 'undefined';
					if (ok || countryStates[action.Country].Player !== action.Player) {
						if (action.Player === user) {
							playerCountries.push(action.Country);
						}
						//If I have lost this country
						if (!ok && countryStates[action.Country].Player === user) {
							playerCountries.filter((country) => country !== action.Country);
						}
						countryStates[action.Country] = new countryState(action.Troops, action.Player);
					} else {
						countryStates[action.Country].Troops += action.Troops;
					}
					break;
				case 'newPlayer':
					if (!players.some((player) => player == action.Player)) {
						console.log(action.Player + ' has entered the chat bois as: ' + action.Country);
						playerColours[action.Player] = action.Country;
						players.push(action.Player);
					}
			}
			this.forceUpdate();
		};
	}

	componentDidMount() {
		window.addEventListener('load', this.onLoad);
	}

	componentWillUnmount() {
		window.removeEventListener('load', this.onLoad);
	}

	onLoad() {
		window.scrollTo(0, window.screen.height / 3.8);
	}

	SideBar() {
		//CSS
		const classes = useStyles();
		//TODO: Fetch #troops, attack, move options, fix data vals

		const [ hidden, setHidden ] = useState(false);
		useHotkeys('q', () =>
			setHidden((bool) => {
				return !bool;
			})
		);

		// Spy Detail Information
		const [ name, setname ] = useState('');
		const [ pop_est, setpop_est ] = useState('');
		const [ gdp, setgdp ] = useState('');
		const [ subrg, setsubrg ] = useState('');
		const [ continent, setcontinent ] = useState('');

		//Currently Clicked Countries
		const [ fromCountry, setfromCountry ] = useState('');
		const [ toCountry, settoCountry ] = useState('');
		const [ toCountryOwner, settoCountryOwner ] = useState('');

		//For the snackbar display settings
		const [ openHelp, setOpenHelp ] = React.useState(false);

		//Show Deployment option?
		const [ allowDeploy, setallowDeploy ] = useState(false);

		//Show Move option?
		const [ allowMove, setallowMove ] = useState(false);

		//Show drop downs?
		const [ showDonate, setshowDonate ] = useState(false);
		const [ showAssist, setshowAssist ] = useState(false);
		const [ showMove, setshowMove ] = useState(false);
		const [ showDeploy, setshowDeploy ] = useState(false);

		//For sending socket message actions (e.g. donate)
		const [ targetPlayer, settargetPlayer ] = useState('');
		const [ numTroops, setnumTroops ] = useState(0);

		//Load up map initially
		const [ countriesLoaded, setcountriesLoaded ] = useState(false);

		// Map of ALL countries and their borders
		const [ countries, changeCountries ] = useState({});

		function loadMap() {
			fetch('/maps/world.txt')
				.then((raw) => raw.text())
				.then((raw) => raw.split('\r\n'))
				.then((lines) => lines.map((s) => s.split(' ')))
				.then((lines) =>
					lines.forEach((line) => {
						changeCountries((state) => ({
							...state,
							[line[0]]: line.slice(1)
						}));
						//countries[line[0]] = line.slice(1);
					})
				);
		}

		if (!countriesLoaded) {
			loadMap();
			setcountriesLoaded(true);
		}

		const convertISO = (NAME, ISO_A2) => {
			if (NAME === 'Somaliland') return 'ZZ';
			if (NAME === 'N. Cyprus') return 'CP';
			return ISO_A2;
		};

		// ISO_A2 of source country
		const [ fromCountryISO, setFromCountryISO ] = useState('');
		// ISO_A2 of dest country
		const [ toCountryISO, setToCountryISO ] = useState('');

		const handleClick = (geo) => {
			const { NAME, ISO_A2 } = geo.properties;

			var iso_a2 = convertISO(NAME, ISO_A2);

			if (fromCountry === '') {
				if (playerCountries.some((iso) => iso === iso_a2)) {
					setFromCountryISO(iso_a2);

					setfromCountry(NAME);
					setallowDeploy(true);
				}
			} else if (NAME === fromCountry) {
				setToCountryISO('');
				setFromCountryISO('');
				setfromCountry('');
				settoCountry('');
				settoCountryOwner('');
				setallowDeploy(false);
				setallowMove(false);
			} else if (countries[fromCountryISO].some((iso) => iso === iso_a2)) {
				setallowDeploy(false);
				settoCountry(NAME);
				settoCountryOwner(countryStates[iso_a2].Player);
				setToCountryISO(iso_a2);
				if (playerCountries.some((iso) => iso === iso_a2)) {
					setallowMove(true);
				} else {
					setallowMove(false);
				}
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

		const handleDeploy = () => {
			setshowDeploy(!showDeploy);
			if (!showDeploy) {
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
			while (!countriesLoaded) {}
			const { NAME, ISO_A2 } = geo.properties;

			var iso_a2 = convertISO(NAME, ISO_A2);

			try {
				var col = playerColours[countryStates[iso_a2].Player];
				if (typeof col == 'undefined') {
					col = '#a69374';
				}
				if (
					fromCountryISO !== '' &&
					countries[fromCountryISO] !== undefined &&
					countries[fromCountryISO].some((iso) => iso === iso_a2)
				) {
					return darken(col, 0.2);
				}
				return col;
			} catch (TypeError) {
				return '#a69374';
			}
		};

		return (
			<div>
				{players.length !== 0 && <PlayerBox classes={classes} playerColours={playerColours} hidden={hidden} />}
				{!hidden ? (
					<Paper className={classes.sidebar}>
						<Grid container style={{ alignText: 'center' }}>
							<Title
								handleCloseHelp={handleCloseHelp}
								handleOpenHelp={handleOpenHelp}
								openHelp={openHelp}
								user={user}
								troops={troops}
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
									socket={socket}
									user={user}
									players={players}
								/>
							)}

							{/* Only show Attack and move/assist options when two countries clicked */}
							{toCountry !== '' && (
								<Grid item xs={12}>
									<Options
										classes={classes}
										toCountry={toCountry}
										fromCountry={fromCountry}
										toCountryOwner={toCountryOwner}
										allowMove={allowMove}
										numTroops={numTroops}
										handleNumTroops={handleNumTroops}
										handleMove={handleMove}
										handleAssist={handleAssist}
										showMove={showMove}
										showAssist={showAssist}
										fromCountryISO={fromCountryISO}
										toCountryISO={toCountryISO}
										socket={socket}
										user={user}
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
									handleDeploy={handleDeploy}
									showDeploy={showDeploy}
									fromCountryISO={fromCountryISO}
									socket={socket}
									user={user}
									troops={troops}
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
				) : null};
				<VectorMap
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
			</div>
		);
	}

	render() {
		return <this.SideBar />;
	}
}

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

export default GameMap;
