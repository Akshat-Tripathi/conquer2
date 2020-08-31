import React from 'react';
import { Grid, Typography, Paper, Snackbar, IconButton } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import HelpIcon from '@material-ui/icons/Help';
import SidebarGeneral from './Components/Sidebar';

const SpyDetails = ({ name, pop_est, gdp, continent, subrg }) => {
	return (
			<table cellSpacing="10" cellPadding="10">
				<thead>
					<tr><th colspan="2" style={{fontSize: '1.5rem'}}>Spy Report On: <div style={{ color: 'yellow' }}>{name}</div></th></tr>
				</thead>
				<SpyDetailItem title="Name" info={name} />
				<SpyDetailItem title="Population:" info={pop_est} />
				<SpyDetailItem title="GDP (PPP):" info={gdp} />
				<SpyDetailItem title="Continent:" info={continent} />
				<SpyDetailItem title="Subregion:" info={subrg} />
			</table>
	);
};

const SpyDetailItem = ({title, info}) => {
	return (
		<tr>
			<td>
				<h4><em>{title}</em></h4>
			</td>
			<td>
				<h5>{info}</h5>
			</td>
		</tr>
	)
}

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
						fontSize: '20px'
					}}
				/>
			</IconButton>
			<Snackbar open={openHelp} autoHideDuration={5000} onClose={handleCloseHelp}>
				<Alert onClose={handleCloseHelp} severity="info">
					This is your control room. Hover above countries to receive encrypted data. Click on countries to
					see your military options.
				</Alert>
			</Snackbar>

			<h1>Welcome, Commander {user}!</h1>

			<div className="stonks-info" style={{color: '#ff4520'}}>
			<h4 style={{color: '#ff4520'}}>Stonks: {troops}</h4>
			<h4 style={{color: '#ff4520'}}>{nextTroops} stonks arriving in <br/> {ETA(interval, startTime)}</h4>
			</div>

			
			{/* <h4 style={{ textAlign: 'center', padding: '1rem', fontSize: '2px' }}>Welcome, Commander {user}!</h4>
			<h6 style={{ textAlign: 'center', fontSize: '1rem' }}>Stonks: {troops}</h6>
			<h6 style={{ textAlign: 'center', fontSize: '1rem' }}>
				<span style={{ color: 'red' }}>{nextTroops} stonks arriving in</span>
			</h6>
			<h6 style={{ textAlign: 'center', fontSize: '1rem' }}>
				<span style={{ color: 'red' }}>{ETA(interval, startTime)}</span>
			</h6> */}
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
				<br/><br/>
				{Object.keys(playerColours).map(function(player) {
					var colour = playerColours[allegiances[player]];
					return (
						<div key={player}>
							<p style={{ fontSize: '30px', textAlign: 'center' }}>
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
