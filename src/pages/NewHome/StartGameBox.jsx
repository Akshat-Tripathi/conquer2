import React, { useState } from 'react';
import {
	Typography,
	Button,
	TextField,
	Paper,
	Slider,
	DialogContentText,
	makeStyles,
	Grid,
	IconButton,
	Select,
	FormControlLabel,
	Checkbox
} from '@material-ui/core';

import CssBaseline from '@material-ui/core/CssBaseline';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { fade } from '@material-ui/core/styles/colorManipulator';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Logo from '../../media/conquer2logo.png';
import Footer from './NewHome';
import './StartGameBox.css';

const useStyles = makeStyles((theme) => ({
	paper: {
		background: 'inherit',
		elevation: '10',
		color: 'white',
		padding: theme.spacing(3)
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

function StartGameBox() {
	const classes = useStyles();
	const [ mode, setmode ] = useState(0);

	const handleModeOne = () => {
		setmode(1);
	};

	const handleModeZero = () => {
		setmode(0);
	};

	const handleModeTwo = () => {
		setmode(2);
	};

	const getOptionContent = (mode) => {
		switch (mode) {
			case 0:
				return <StartContent setModeToOne={handleModeOne} setModeToTwo={handleModeTwo} />;
			case 1:
				return <JoinGame setModeToZero={handleModeZero} />;
			case 2:
				return <CreateGame setModeToZero={handleModeZero} />;
			default:
				throw new Error('?? what happened ...');
		}
	};

	return (
		<body id="s-g-b">
			<div className="main" id="s-g-b">
				<div className="logo-wrapper" id="s-g-b">
					<img src={Logo} />
				</div>
				<div>
					<CssBaseline />
					<Paper className={[ classes.paper, 'center-gamebox' ]} elevation={3}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Typography component="h3" variant="h5" align="center">
									It's time to begin Commander.
								</Typography>
							</Grid>
							{getOptionContent(mode)}
						</Grid>
					</Paper>
				</div>
			</div>
		</body>
	);
}

const StartContent = ({ setModeToOne, setModeToTwo }) => {
	return (
		<React.Fragment>
			<Grid item xs={12} sm={6}>
				<div
					style={{
						marginLeft: '10%',
						marginRight: '10%',
						marginTop: '10%',
						marginBottom: '10%',
						textAlign: 'center',
						fontSize: '50'
					}}
				>
					<IconButton aria-label="newgame" color="primary" size="medium" onClick={setModeToTwo}>
						<AddCircleIcon
							style={{
								fontSize: '50'
							}}
						/>
					</IconButton>
					<Typography variant="subtitle2">Create New Game</Typography>
				</div>
			</Grid>
			<Grid item xs={12} sm={6}>
				<div
					style={{
						marginLeft: '10%',
						marginRight: '10%',
						marginTop: '10%',
						marginBottom: '10%',
						textAlign: 'center'
					}}
				>
					<IconButton aria-label="joingame" color="secondary" size="medium" onClick={setModeToOne}>
						<DoubleArrowIcon
							style={{
								fontSize: '50'
							}}
						/>
					</IconButton>
					<Typography variant="subtitle2">Join Game</Typography>
				</div>
			</Grid>
		</React.Fragment>
	);
};

const JoinGame = ({ setModeToZero }) => {
	return (
		<Grid items xs={12}>
			<Paper className="gamebox-wrapper" styles={{ height: '50px' }}>
				<DialogContentText style={{ color: 'white' }}>Join a world war and save the day.</DialogContentText>

				<form action="/join" method="POST">
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<TextField type="text" id="ign" placeholder="Username" name="username" required />
						</Grid>
						<Grid item xs={12}>
							<TextField type="password" placeholder="Password" name="password" required />
						</Grid>
						<Grid item xs={12}>
							<TextField type="text" placeholder="Game Id" name="id" required />
						</Grid>
						<Grid item xs={12}>
							<Button type="submit" name="submit" value="join" variant="outlined" color="secondary">
								Join Game
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>
			<IconButton aria-label="return" color="secondary" onClick={setModeToZero}>
				<ArrowBackIcon
					style={{
						fontSize: '50'
					}}
				/>
				<Typography variant="subtitle1">Back</Typography>
			</IconButton>
		</Grid>
	);
};

const CreateGame = ({ setModeToZero }) => {
	return (
		<Grid items xs={12}>
			<Paper className="gamebox-wrapper" styles={{ height: '50px', backgroundColor: 'black' }}>
				<DialogContentText>Creating a new game...</DialogContentText>
				<form action="/create" method="POST">
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Select
								className="gamemode"
								id="type"
								name="type"
								label="Gamemode"
								required
								variant="outlined"
								placeholder="Regular"
							>
								<MenuItem value="realtime">Regular</MenuItem>
								<MenuItem value="campaign">Campaign</MenuItem>
								<MenuItem value="capital">Capital Supremacy</MenuItem>
							</Select>
						</Grid>
						<Grid item xs={12}>
							<TextField type="text" placeholder="Username" name="username" required variant="outlined" />
						</Grid>
						<Grid item xs={12}>
							<TextField
								type="password"
								placeholder="Password"
								name="password"
								required
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								className="noOfPlayers"
								type="number"
								placeholder="Max No. Players"
								name="maxPlayers"
								required
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								type="number"
								placeholder="Starting No. Troops"
								name="startingTroops"
								required
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								type="number"
								placeholder="Starting # Countries"
								name="startingCountries"
								required
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography gutterBottom>Please Specify Troop Interval</Typography>
							<Slider
								defaultValue={5}
								aria-labelledby="troopInterval"
								step={1}
								marks
								min={1}
								max={5}
								valueLabelDisplay="auto"
								name="troopInterval"
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={<Checkbox color="secondary" name="tncs" value="yes" />}
								label="I agree with the Imperium Games Terms and Conditions"
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<Button type="submit" name="submit" value="create" variant="outlined" color="secondary">
								Commence WAR
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>
			<IconButton aria-label="return" color="secondary" onClick={setModeToZero}>
				<ArrowBackIcon
					style={{
						fontSize: '50'
					}}
				/>
				<Typography variant="subtitle1">Back</Typography>
			</IconButton>
		</Grid>
	);
};

export default StartGameBox;
