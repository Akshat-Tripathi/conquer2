import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
	Typography,
	IconButton,
	Snackbar,
	Grid,
	Button,
	Select,
	MenuItem,
	FormHelperText,
	FormControl
} from '@material-ui/core';

import { players, fromCountryISO, toCountryISO, user, socket } from './Map';

const Options = ({
	classes,
	toCountry,
	fromCountry,
	allowMove,
	handleNumTroops,
	numTroops,
	showAssist,
	showMove,
	handleMove,
	handleAssist
}) => {
	if (toCountry !== '' && fromCountry !== '') {
		return (
			<div>
				<Grid item xs={12}>
					<Typography variant="h5">
						{' '}
						From <span style={{ color: 'lightgreen' }}>{fromCountry}</span> To{' '}
						<span style={{ color: 'red' }}>{toCountry}</span>
					</Typography>
				</Grid>
				{!allowMove ? (
					<div>
						<Grid item xs={12} sm={6}>
							<Button
								variant="contained"
								size="small"
								color="secondary"
								className={classes.button}
								onClick={attack}
							>
								ATTACK
							</Button>
						</Grid>
						<Grid item xs={12} sm={6}>
							<AssistForm
								showAssist={showAssist}
								handleNumTroops={handleNumTroops}
								numTroops={numTroops}
								classes={classes}
								handleAssist={handleAssist}
							/>
						</Grid>
					</div>
				) : (
					<div>
						<Grid item xs>
							<MoveForm
								showMove={showMove}
								handleNumTroops={handleNumTroops}
								numTroops={numTroops}
								classes={classes}
								handleMove={handleMove}
							/>
						</Grid>
					</div>
				)}
			</div>
		);
	}
};

const DonateForm = ({
	handleDonate,
	classes,
	handleNumTroops,
	handletargetPlayer,
	targetPlayer,
	showDonate,
	numTroops
}) => {
	return !showDonate ? (
		<Grid item xs={12}>
			<Button variant="contained" size="small" color="primary" className={classes.button} onClick={handleDonate}>
				DONATE
			</Button>
		</Grid>
	) : (
		<div>
			<Grid container spacing={1} style={{ alignContent: 'center' }}>
				<Grid item xs>
					<FormControl className={classes.input}>
						<Select
							name="donateTo"
							required
							variant="outlined"
							value={targetPlayer}
							onChange={handletargetPlayer}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
							{players.map(function(p) {
								if (p != user) {
									return <MenuItem value={p}>{p}</MenuItem>;
								}
							})}
						</Select>
						<FormHelperText style={{ color: 'white' }}>Select Player to Donate to</FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs>
					<FormControl classes={classes.input}>
						<Select
							name="donateNumTroops"
							required
							variant="outlined"
							label="Number of Troops to Donate"
							value={numTroops}
							onChange={handleNumTroops}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={20}>20</MenuItem>
							<MenuItem value={50}>50</MenuItem>
						</Select>
						<FormHelperText style={{ color: 'white' }}>Select Number of Troops to Donate</FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => donate(numTroops, targetPlayer)}
					>
						CONFIRM DONATION
					</Button>
				</Grid>
			</Grid>

			<Grid item xs={12}>
				<IconButton aria-label="return" color="secondary" onClick={handleDonate}>
					<ArrowBackIcon
						style={{
							fontSize: '30'
						}}
					/>
					<Typography variant="subtitle2">Back</Typography>
				</IconButton>
			</Grid>
		</div>
	);
};

const AssistForm = ({ numTroops, classes, handleNumTroops, showAssist, handleAssist }) => {
	return !showAssist ? (
		<Grid item xs={12}>
			<Button variant="contained" size="small" color="primary" className={classes.button} onClick={handleAssist}>
				ASSIST
			</Button>
		</Grid>
	) : (
		<div>
			<Grid container spacing={2} style={{ alignContent: 'center' }}>
				<Grid item xs>
					<FormControl classes={classes.input}>
						<Select
							name="donateNumTroops"
							required
							variant="outlined"
							label="Number of Troops for the Assist"
							value={numTroops}
							onChange={handleNumTroops}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={20}>20</MenuItem>
							<MenuItem value={50}>50</MenuItem>
						</Select>
						<FormHelperText style={{ color: 'white' }}>Select Number of Troops to send </FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => move(numTroops)}
					>
						CONFIRM ASSISTANCE
					</Button>
				</Grid>
			</Grid>

			<Grid item xs={12}>
				<IconButton aria-label="return" color="secondary" onClick={handleAssist}>
					<ArrowBackIcon
						style={{
							fontSize: '30'
						}}
					/>
					<Typography variant="subtitle2">Back</Typography>
				</IconButton>
			</Grid>
		</div>
	);
};

const MoveForm = ({ numTroops, classes, handleNumTroops, showMove, handleMove }) => {
	return !showMove ? (
		<Grid item xs={12}>
			<Button variant="contained" size="small" color="secondary" className={classes.button} onClick={handleMove}>
				MOVE
			</Button>
		</Grid>
	) : (
		<div>
			<Grid container spacing={2} style={{ alignContent: 'center' }}>
				<Grid item xs>
					<FormControl classes={classes.input}>
						<Select
							name="donateNumTroops"
							required
							variant="outlined"
							label="Number of Troops to Donate"
							value={numTroops}
							onChange={handleNumTroops}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={20}>20</MenuItem>
							<MenuItem value={50}>50</MenuItem>
						</Select>
						<FormHelperText style={{ color: 'white' }}>Select Number of Troops to move </FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => move(numTroops)}
					>
						CONFIRM MOVE
					</Button>
				</Grid>
			</Grid>

			<Grid item xs={12}>
				<IconButton aria-label="return" color="secondary" onClick={handleMove}>
					<ArrowBackIcon
						style={{
							fontSize: '30'
						}}
					/>
					<Typography variant="subtitle2">Back</Typography>
				</IconButton>
			</Grid>
		</div>
	);
};

const OptionsDeploy = ({ classes, numTroops, handleNumTroops, fromCountry, handleDeploy, showDeploy }) => {
    function handleClick(e) {
        e.preventDefault();
        deploy(numTroops);
      }
    return (
		<Grid item xs={12} sm={6}>
			<Typography variant="h5">
				<span>
					Deploy from{' '}
					<strong>
						<span style={{ color: 'green' }}>Base</span>
					</strong>{' '}
					to{' '}
					<strong>
						<span style={{ color: 'orange' }}>{fromCountry}</span>
					</strong>
				</span>
			</Typography>

			{!showDeploy ? (
				<Grid item xs={12}>
					<Button
						variant="contained"
						size="small"
						color="secondary"
						className={classes.button}
						onClick={handleDeploy}
					>
						DEPLOY
					</Button>
				</Grid>
			) : (
				<div>
					<Grid container spacing={2} style={{ alignContent: 'center' }}>
						<Grid item xs>
							<FormControl classes={classes.input}>
								<Select
									name="donateNumTroops"
									required
									variant="outlined"
									placeholder={5}
									label="Number of Troops to Donate"
									value={numTroops}
									onChange={handleNumTroops}
									className={classes.select}
									style={{ color: 'yellow', borderColor: 'white' }}
								>
									{/* //TODO: Update value= num of base troops */}
									<MenuItem value={0}>All Base Troops</MenuItem>
									<MenuItem value={5}>5</MenuItem>
									<MenuItem value={10}>10</MenuItem>
									<MenuItem value={20}>20</MenuItem>
									<MenuItem value={50}>50</MenuItem>
								</Select>
								<FormHelperText style={{ color: 'white' }}>
									Select Number of Base Troops to Deploy
								</FormHelperText>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<Button
								variant="contained"
								size="small"
								color="primary"
								className={classes.button}
								onClick={handleClick}
							>
								DEPLOY
							</Button>
						</Grid>
					</Grid>

					<Grid item xs={12}>
						<IconButton aria-label="return" color="secondary" onClick={handleDeploy}>
							<ArrowBackIcon
								style={{
									fontSize: '30'
								}}
							/>
							<Typography variant="subtitle2">Back</Typography>
						</IconButton>
					</Grid>
				</div>
			)}
		</Grid>
	);
};

class action {
	constructor(Troops, ActionType, Src, Dest, Player) {
		this.Troops = Troops;
		this.ActionType = ActionType;
		this.Src = Src;
		this.Dest = Dest;
		this.Player = Player;
	}
}

var act = new action();

function attack() {
	act.Troops = 0;
	act.ActionType = 'attack';
	act.Src = fromCountryISO;
	act.Dest = toCountryISO;
	act.Player = user;
	socket.send(JSON.stringify(act));
}

function donate(numTroops, targetPlayer) {
	act.Troops = numTroops;
	act.ActionType = 'donate';
	act.Dest = targetPlayer;
	act.Player = user;
	socket.send(JSON.stringify(act));
}

function move(numTroops) {
	act.Troops = numTroops;
	act.ActionType = 'move';
	act.Src = fromCountryISO;
	act.Dest = toCountryISO;
	act.Player = user;
	socket.send(JSON.stringify(act));
}

function deploy(numTroops) {
	act.Troops = numTroops;
	act.ActionType = 'drop';
	act.Dest = fromCountryISO;
	act.Player = user;
	socket.send(JSON.stringify(act));
}

export { Options, OptionsDeploy, DonateForm };
