import React from 'react';
import { Grid, Typography, Paper, Snackbar, IconButton } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import HelpIcon from '@material-ui/icons/Help';
import SidebarGeneral from './Components/Sidebar';

const SpyDetails = ({ name, pop_est, gdp, continent, subrg }) => {
	return (
		<div>
			<Grid container spacing={12}>
				<Grid item xs={12} style={{ alignText: 'center' }}>
					<h2>
						Spy Report On: <div style={{ color: 'yellow' }}>{name}</div>
					</h2>
					<br />
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>Population: </h3>
					<subtitle1>{pop_est}</subtitle1>
					<br />
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>GDP (PPP): </h3>
					<subtitle1>{gdp}</subtitle1>
					<br />
				</Grid>
				<Grid item xs={12} sm={6}>
					<h3>Continent</h3>
					<subtitle1>{continent}</subtitle1>
					<br />
				</Grid>
				<Grid item xs={12} sm={6}>
					{continent !== 'South America' && (
						<div>
							<h3>Subregion: </h3>
							<subtitle1>{subrg}</subtitle1>
							<Typography variant="subtitle1">{subrg} </Typography>
						</div>
					)}
					<br />
				</Grid>
				<Grid item xs={12}>
					<h3>Allegiance: </h3>
					<Typography variant="subtitle1">Ohio </Typography>
					<br />
				</Grid>
			</Grid>
		</div>
	);
};

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

//PRE: n >= 0 && n < 100
function stringifyInt(n) {
	let str = n;
	if (n < 10) {
		str = '0' + str;
	}
	return str;
}

function ETA(interval, start) {
	const [ seconds, setSeconds ] = React.useState(0);

	let resetClock = () => {
		let date = new Date();
		let secondsFromStart = Math.floor(date.getTime() / 1000) - start;
		setSeconds(interval * 60 - secondsFromStart % (interval * 60));
	};

	React.useEffect(() => {
		if (seconds >= 0) {
			setTimeout(() => setSeconds(seconds - 1), 1000);
		} else {
			resetClock();
		}
	});

	var hourPart = Math.floor(seconds / 3600) % 24;
	var minutePart = Math.floor(seconds / 60) % 60;
	var secondsPart = seconds % 60;

	var str = stringifyInt(secondsPart);

	if (minutePart !== 0) {
		str = stringifyInt(minutePart) + ':' + str;
		if (hourPart !== 0) {
			str = stringifyInt(hourPart) + ':' + str;
		}
	}
	return str;
}

const Title = ({ handleCloseHelp, handleOpenHelp, openHelp, user, troops, interval, startTime, nextTroops }) => {
	return (
		<div>
			<IconButton aria-label="help" color="primary" size="small" onClick={handleOpenHelp}>
				<HelpIcon
					style={{
						fontSize: '20'
					}}
				/>
			</IconButton>

			<Snackbar open={openHelp} autoHideDuration={5000} onClose={handleCloseHelp}>
				<Alert onClose={handleCloseHelp} severity="info">
					This is your control room. Hover above countries to receive encrypted data. Click on countries to
					see your military options.
				</Alert>
			</Snackbar>

			<h4 style={{ textAlign: 'center', padding: '1rem' }}>Welcome, Commander {user}!</h4>
			<br />

			<h6 style={{ textAlign: 'center', fontSize: '2rem' }}>Stonks: {troops}</h6>

			<h6 style={{ textAlign: 'center', fontSize: '2rem' }}>
				<span style={{ color: 'red' }}>{nextTroops} stonks arriving in</span>
			</h6>
			<h6 style={{ textAlign: 'center', fontSize: '2rem' }}>
				<span style={{ color: 'red' }}>{ETA(interval, startTime)}</span>
			</h6>
			<br />
		</div>
	);
};

const PlayerBox = ({ classes, playerColours, hidden, allegiances }) => {
	return !hidden ? (
		<div>
			{/* <Paper className={classes.players}> */}
			<SidebarGeneral width={300} height={'100vh'} title="Players">
				<div style={{ padding: '1rem' }}>
					<h1>Players</h1>
				</div>
				<Typography variant="subtitle2">
					{'Game ID: ' +
						document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] === 'id')[0][1]}
				</Typography>
				{Object.keys(playerColours).map(function(player) {
					var colour = playerColours[allegiances[player]];
					return (
						<div key={player} style={{ padding: '5%' }}>
							<p style={{ fontSize: '10px', textAlign: 'center' }}>
								<span style={{ color: colour }}>{player}</span>
							</p>
						</div>
					);
				})}
			</SidebarGeneral>
			{/* </Paper> */}
		</div>
	) : null;
};
export { SpyDetails, PlayerBox, Title };
