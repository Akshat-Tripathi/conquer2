import React, { Component, useState } from 'react';
import { connect, loaddetails } from '../../api/index.js';
import { Paper, makeStyles, Grid } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import VectorMap from './VectorMap';
import './Map.css';
import { Options, OptionsDeploy, DonateForm } from './ActionButtons';
import { SpyDetails, PlayerBox, Title } from './Texts';

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

class GameMap extends Component {

	constructor() {
        super();
        socket = connect();
        socket.onmessage = (msg) => {
            var action = JSON.parse(msg.data);
            switch (action.Type) {
                case 'updateTroops':
                    user = action.Player;
                    troops += action.Troops;
                    break;
                case 'updateCountry':
                    if (
                        typeof countryStates[action.Country] === 'undefined' ||
                        countryStates[action.Country].Player !== action.Player
                    ) {
                        if (action.Player === user) {
                            playerCountries.push(action.Country);
                        }
                        if (countryStates[action.Country] === user) {
                            playerCountries.filter((country) => country !== action.Country);
                        }
                        countryStates[action.Country] = new countryState(action.Troops, action.Player);
                    } else {
                        countryStates[action.Country].Troops += action.Troops;
                    }
                    break;
                case 'newPlayer':
                    console.log(action.Player + ' has entered the chat bois as: ' + action.Country);
                    playerColours[action.Player] = action.Country;
                    players.push(action.Player);
            }
        };
	}

    SideBar() {
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
        var countries = {}; 
        
        function loadMap() {
            fetch('/maps/world.txt')
                .then((raw) => raw.text())
                .then((raw) => raw.split('\r\n'))
                .then((lines) => lines.map((s) => s.split(' ')))
                .then((lines) =>
                    lines.forEach((line) => {
                        countries[line[0]] = line.slice(1);
                    })
                );
        }
    
        if (!countriesLoaded) {
            loadMap();
            setcountriesLoaded(true);
        }
    
        // ISO_A2 of source country
        const [ fromCountryISO, setFromCountryISO ] = useState('');
        // ISO_A2 of dest country
        const [ toCountryISO, setToCountryISO ] = useState('');

        const handleClick = (geo) => {
            const { NAME, ISO_A2 } = geo.properties;
    
            if (fromCountry === '') {
                if (playerCountries.some((iso) => iso === ISO_A2)) {
                    setFromCountryISO(ISO_A2);
    
                    setfromCountry(NAME);
                    setallowDeploy(true);
                }
            } else if (NAME === fromCountry) {
                setToCountryISO('');
                setFromCountryISO('');
                setfromCountry('');
                settoCountry('');
                setallowDeploy(false);
                setallowMove(false);
            } else {
                //TODO: Is own country: Enable Move
                //TODO: Another country: Enable attack/assist
                // TODO: Check if neighbouring country
                // if (countries[fromCountryISO].some((iso) => iso === ISO_A2)) {
                // }
                setallowDeploy(false);
                settoCountry(NAME);
                setToCountryISO(ISO_A2);
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
            while (!countriesLoaded) {
                console.log("hi");
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
                {players.length !== 0 && <PlayerBox classes={classes} playerColours={playerColours} />}
                <Paper className={classes.sidebar}>
                    <Grid container style={{ alignText: 'center' }}>
                        <Title
                            username={user}
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
                    countryStates={countryStates}
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