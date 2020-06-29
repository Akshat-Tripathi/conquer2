import React from 'react';
import { Grid, Typography, Paper, Snackbar, IconButton } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import MuiAlert from '@material-ui/lab/Alert';
import HelpIcon from '@material-ui/icons/Help';

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

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Title = ({ handleCloseHelp, handleOpenHelp, openHelp, user, troops }) => {
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
	)
};

const PlayerBox = ({ classes, playerColours, hidden }) => {
	return !hidden ? (
		<div>
			<Paper className={classes.players}>
				<Typography variant="subtitle1">PLAYERS:</Typography>
				<Grid container spacing={12} direction={"column"}>
					{Object.keys(playerColours).map(function(player) {
						var colour = playerColours[player];
						return (
							<div key={player} style={{ padding: '5%' }}>
								<Grid container spacing={12} direction={"row"}>
									<Grid item xs={12} alignItems={"stretch"}>
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
	) : (null);
};

export { SpyDetails, PlayerBox, Title };
