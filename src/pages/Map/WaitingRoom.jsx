import React, { Component, useState, useEffect } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { GiThumbUp, GiInfo } from 'react-icons/gi';
import { action } from '../Map/ActionButtons';
import { FcCheckmark, FcCancel } from 'react-icons/fc';
import { useSpring, animated as a, useTransition } from 'react-spring';
import { playerReady } from './Map';
// import { connect, loaddetails } from '../../websockets/index.js';
import Typist from 'react-typist';
import './WaitingRoom.css';
import ChatPopup from './ChatPopup';

// class readyPlayer {
// 	constructor(Player, IsReady) {
// 		this.Player = Player;
// 		this.IsReady = IsReady;
// 		this.Type = 'readyPlayer';
// 	}
// }

function handleVote({ socket, user }) {
	//TODO: send vote request and add ready up thingy
	// const readyup = new action(null, 'readyUp', null, null, this.props.user);
	// const readyup = new readyPlayer(this.props.user, true);

	var readyup = new action(0, 'imreadym9', '', '', user);
	socket.send(JSON.stringify(readyup));
}

const WaitingRoom = ({ playerColours, user, socket, playerReady }) => {
	// var playerColours = playerColours;
	// var ImReady = playerReady[user];

	//FIXME: Temporary
	var ImReady = false;

	return (
		<div>
			<div className="backdrop" />
			<header className="container">
				<h2 style={{ color: 'orange' }}>LOBBY - Waiting for players...</h2>
				{/* <p style={{ color: 'orange' }}>
					{'Game ID: ' +
						document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] == 'id')[0][1]}
				</p> */}
			</header>
			<body className="lobby-grid">
				<div className="player-list">
					<div className="players">
						<h3 style={{ color: 'white' }}>Joined Players </h3>

						{/* {Object.keys(playerColours).map(function(player) {
							var isReady = playerReady[player];
							var colour = playerColours[player];
							return (
								<div className="player-name" key={player}>
									<div style={{ verticalAlign: 'middle', marginBottom: '1%' }}>
										<span style={{ color: colour, paddingInline: '1%' }}>
											{player}
											&ensp;
											<ReadyIcon isReady={isReady} />
										</span>
									</div>
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
					{!ImReady ? (
						<div>
							<IconButton
								aria-label="ready-up"
								style={{ color: 'red' }}
								size="medium"
								onClick={() => handleVote({ socket, user })}
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
};

const ResponsiveWaitingRoom = ({ playerColours, user, socket, playerReady }) => {
	var playerColours = playerColours;
	var ImReady = playerReady[user];

	//FIXME: Temporary
	var ImReady = false;

	return (
		<div>
			<div className="backdrop" />
			<div className="lobby-grid">
				<div className="wr-title">
					<h1>Lobby</h1>
					<p style={{ color: 'orange' }}>
						{'Game ID: ' +
							document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] == 'id')[0][1]}
					</p>
				</div>
				<div className="spinny-thingy">
					<div className="lds-hourglass" />
				</div>
				<div className="players-list">
					<div className="players-list-title">
						<h3 style={{ color: 'white' }}>Joined Players </h3>
					</div>
					<div className="players-list-playernames">
						{Object.keys(playerColours).map(function(player) {
							var isReady = playerReady[player];
							var colour = playerColours[player];
							return (
								<div className="player-name" key={player}>
									<div style={{ verticalAlign: 'middle', marginBottom: '1%' }}>
										<span style={{ color: colour, paddingInline: '1%' }}>
											{player}
											&ensp;
											<ReadyIcon isReady={isReady} />
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="tips-n-tricks">
					<div className="left-tat">
						<GiInfo style={{ fontSize: '60px' }} />
					</div>
					<div className="right-tat">
						<AssistancesSlider />
					</div>
				</div>
				<div className="chat">
					<ChatPopup />
				</div>
				<div className="ready-up-button">
					<ReadyUp ImReady={ImReady} socket={socket} user={user} />
				</div>
			</div>
		</div>
	);
};

const ReadyUp = ({ ImReady, socket, user }) => {
	return (
		<div>
			{!ImReady ? (
				<div className="readyup-icons">
					<IconButton
						aria-label="ready-up"
						style={{ color: 'red' }}
						size="medium"
						onClick={() => handleVote({ socket, user })}
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
				<div className="readyup-icons">
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
	);
};

const ReadyIcon = ({ isReady }) => {
	if (isReady === true) {
		return <FcCheckmark />;
	}
	return <FcCancel />;
};

const AssistancesSlider = () => {
	const [ index, setindex ] = useState(0);

	useEffect(() => {
		setInterval(() => {
			setindex((i) => (i === Assistances.length - 1 ? 0 : i + 1));
		}, 5000);
	}, []);

	const transitions = useTransition(Assistances[index], null, {
		from: { o: 0 },
		enter: { o: 1 },
		leave: { o: 2 },
		config: { duration: 150 }
	});
	return transitions.map(({ item, key, props }) => (
		<a.div
			style={{
				opacity: props.o.interpolate([ 0, 0.5, 1, 1.5, 2 ], [ 0, 0, 1, 0, 0 ]),
				width: '250px'
			}}
		>
			{item}
		</a.div>
	));
};

const Assistances = [
	"Press Q to remove dashboards while you're playing to see the map more clearly!",
	'Make sure to check what countries are bordering your countries when moving troops',
	"Don't leave 1 troops behind! They can accumulate and form a large army!",
	'Form alliances! One vs All approaches have hardly ever won the game!'
];

export default ResponsiveWaitingRoom;
