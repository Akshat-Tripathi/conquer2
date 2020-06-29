import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
	Typography,
	IconButton,
	Select,
	Grid,
    Button,
    Input,
	MenuItem,
	FormHelperText,
	FormControl
} from '@material-ui/core';

//import { players, fromCountryISO, toCountryISO, user, socket, countryStates } from './Map';

const Options = ({
	classes,
	fromCountry,
    toCountry,
    toCountryOwner,
    fromCountryISO,
    toCountryISO,
	allowMove,
	handleNumTroops,
    numTroops,
    showMove,
	showAssist,
	handleMove,
    handleAssist,
    socket,
    user
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
                { !allowMove ? (
                        <div>
                            {toCountryOwner != user ? (
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="secondary"
                                        className={classes.button}
                                        onClick={() => attack(fromCountryISO, toCountryISO, user, socket)}
                                    >
                                        ATTACK
                                    </Button>
                                </Grid>
                            ) : (null)}
                            <Grid item xs={12} sm={6}>
                                <AssistForm
                                    showAssist={showAssist}
                                    handleNumTroops={handleNumTroops}
                                    numTroops={numTroops}
                                    classes={classes}
                                    handleAssist={handleAssist}
                                    fromCountryISO={fromCountryISO}
                                    toCountryISO={toCountryISO}
                                    socket={socket}
                                    user={user}
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
                                    fromCountryISO={fromCountryISO}
                                    toCountryISO={toCountryISO}
                                    socket={socket}
                                    user={user}
                                />
                            </Grid>
                        </div>
                    )
                }
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
    numTroops,
    socket,
    user,
    players
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
                        <Input
                            type="number"
                            min="0"
							name="donateNumTroops"
							required
							variant="outlined"
							label="Number of Troops to Donate"
							value={numTroops}
							onChange={handleNumTroops}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
						</Input>
						<FormHelperText style={{ color: 'white' }}>Select Number of Troops to Donate</FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => donate(numTroops, targetPlayer, user, socket)}
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

const AssistForm = ({ numTroops, classes, handleNumTroops, showAssist, handleAssist, fromCountryISO, toCountryISO, socket, user }) => {
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
						<Input
                            type="number"
                            min="0"
							name="donateNumTroops"
							required
							variant="outlined"
							label="Number of Troops for the Assist"
							value={numTroops}
							onChange={handleNumTroops}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
						</Input>
						<FormHelperText style={{ color: 'white' }}>Select Number of Troops to send </FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => move(numTroops, fromCountryISO, toCountryISO, user, socket)}
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

const MoveForm = ({ numTroops, classes, handleNumTroops, showMove, handleMove, fromCountryISO, toCountryISO, socket, user }) => {
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
						<Input
                            type="number"
                            min="0"
							name="donateNumTroops"
							required
                            variant="outlined"
                            placeholder={5}
							label="Number of Troops to Move"
							value={numTroops}
                            onChange={handleNumTroops}
                            className={classes.input}
							style={{ color: 'yellow', borderColor: 'white' }}
						>
						</Input>
						<FormHelperText style={{ color: 'white' }}>
                            Select Number of Troops to move
                        </FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<Button
						variant="outlined"
						size="small"
						color="primary"
						className={classes.button}
						onClick={() => move(numTroops, fromCountryISO, toCountryISO, user, socket)}
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

const OptionsDeploy = ({ classes, numTroops, handleNumTroops, fromCountry, handleDeploy, showDeploy, fromCountryISO, socket, user, troops }) => {
    function handleClick(e) {
        e.preventDefault();
        deploy(numTroops, fromCountryISO, user, socket);
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
								<Input
                                    type="number"
                                    min="0"
									name="donateNumTroops"
									required
									variant="outlined"
									placeholder={5}
									label="Number of Troops to Deploy"
									value={numTroops}
									onChange={handleNumTroops}
									className={classes.input}
									style={{ color: 'yellow', borderColor: 'white' }}
								>
								</Input>
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

function attack(fromCountryISO, toCountryISO, user, socket) {
    const atk = new action(
        0,
        'attack',
        fromCountryISO,
        toCountryISO,
        user
    );
    socket.send(JSON.stringify(atk));
}

function donate(numTroops, targetPlayer, user, socket) {
    const dnt = new action(
        parseInt(numTroops, 10),
        'donate',
        '',
        targetPlayer,
        user
    )
	socket.send(JSON.stringify(dnt));
}

function move(numTroops, fromCountryISO, toCountryISO, user, socket) {
    const mve = new action(
        parseInt(numTroops, 10),
        'move',
        fromCountryISO,
        toCountryISO,
        user
    );
	socket.send(JSON.stringify(mve));
}

function deploy(numTroops, fromCountryISO, user, socket) {
    const dpl = new action(
        parseInt(numTroops, 10),
        'drop',
        '',
        fromCountryISO,
        user
    );
	socket.send(JSON.stringify(dpl));
}

export { Options, OptionsDeploy, DonateForm };
