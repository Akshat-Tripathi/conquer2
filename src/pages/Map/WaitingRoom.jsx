import React, { Component, useState, useEffect } from 'react';
import { Typography, Grid, IconButton } from '@material-ui/core';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { GiThumbUp, GiInfo } from 'react-icons/gi';
import { useSpring, animated } from 'react-spring';

import './WaitingRoom.css';

export default class WaitingRoom extends Component {
	constructor() {
		super();
		this.state = { notReady: true };
	}

	handleVote() {
		//TODO: send vote request and add ready up thingy
		this.setState({ notReady: false });
	}

	render() {
		var playerColours = this.props.playerColours;
		return (
			<div>
				<div className="backdrop" />
				<header className="container">
					{/* <div id="tv">WAITING ROOM</div> */}
					<h2 style={{ color: 'orange' }}>LOBBY - Waiting for players...</h2>
					<p>
						{/* {'Game ID: ' +
							document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] == 'id')[0][1]} */}
					</p>
				</header>
				<body>
					<div className="player-list">
						<div className="players">
							<h4 style={{ color: 'white' }}>Joining Players (Max 20)</h4>

							{/* {Object.keys(playerColours).map(function(player) {
								var colour = playerColours[player];
								return (
									<div className="player-name" key={player}>
										<span style={{ color: colour }}>{player}</span>
									</div>
								);
							})} */}
						</div>
					</div>
					<div className="tips-and-tricks">
						<div className="left-tat">
							<GiInfo style={{ fontSize: '40' }} />
						</div>
						<div className="right-tat">
							<AssistancesSlider />
						</div>
					</div>
					<div className="br-box">
						{this.state.notReady ? (
							<div>
								<IconButton
									aria-label="ready-up"
									style={{ color: 'red' }}
									size="medium"
									onClick={() => this.handleVote()}
								>
									<DoubleArrowIcon
										style={{
											fontSize: '50'
										}}
									/>
								</IconButton>
								<Typography variant="h6" style={{ color: 'red' }}>
									READY UP
								</Typography>
							</div>
						) : (
							<div>
								<IconButton aria-label="ready-up" style={{ color: 'green' }} size="medium">
									<GiThumbUp
										style={{
											fontSize: '50'
										}}
									/>
								</IconButton>
								<Typography variant="h6" style={{ color: 'green' }}>
									READY
								</Typography>
							</div>
						)}
					</div>
				</body>
			</div>
		);
	}
}

const AssistancesSlider = () => {
	const props = useSpring({ opacity: 1, from: { opacity: 0 } });

	const [ seconds, setSeconds ] = useState(0);
	const [ index, setindex ] = useState(0);
	const gap = 5;

	React.useEffect(() => {
		if (seconds >= 0) {
			setTimeout(() => setSeconds(seconds - 1), 1000);
		} else {
			setindex((i) => i + 1);
			if (index === Assistances.length - 1) {
				setindex(0);
			}
			setSeconds(gap);
			console.log(index);
		}
	});

	return <animated.div style={props}>{Assistances[index]}</animated.div>;
};
const Assistances = [
	"Press Q to remove dashboards while you're playing to see the map more clearly!",
	'Make sure to check what countries are bordering your countries when moving troops',
	"Don't leave 1 troops behind! They can accumulate and form a large army!",
	'Form alliances! One vs All approaches have hardly ever won the game!'
];
