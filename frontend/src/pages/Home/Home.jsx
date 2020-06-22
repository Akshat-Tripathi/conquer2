import React, { Component } from 'react';
import StartGameBox from './StartGameBox';
import Video from './Video.jsx';
import Grid from '@material-ui/core/Grid';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import './Home.css';

class Home extends Component {
	render() {
		return (
			<div className="home-page">
				<CssBaseline />
				<Grid container>
					<Grid item xs={12}>
						<Typography variant="h2">CONQUER 2.0</Typography>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="subtitle1">Fight to the death...</Typography>
					</Grid>
				</Grid>
				<Video />
				<StartGameBox />
				<Footer />
			</div>
		);
	}
}

function Footer() {
	return (
		<div style={{ position: 'fixed' }}>
			<Grid
				container
				xs={12}
				style={{
					color: 'white',
					position: 'fixed',
					left: 0,
					bottom: 0,
					width: '100%',
					background: fade('#000000', 0.8),
					color: 'white',
					textAlign: 'center'
				}}
			>
				<Grid item xs={12}>
					<Typography variant="subtitle1">Conquer V2.0 &copy;</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="subtitle1">By Imperium Games</Typography>
				</Grid>
			</Grid>
		</div>
	);
}

export default Home;
