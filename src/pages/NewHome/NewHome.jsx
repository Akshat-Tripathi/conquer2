import React, { Component, useState, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import './NewHome.css';
import { PollBox, MemeRating, Testimonials, RSSFeedGameSpot, Podcast } from './Plugs';

import videoSource from '../../media/fireball.mp4';
import AllDevices from '../../media/AllDevices.png';
import NextUpdateBanner from '../../media/NextUpdate.jpg';
import Meme from '../../media/DominoMemes/meme1.jpeg';

import { Button, Grid } from '@material-ui/core';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

export var signedIn = false;

const LoginGBButton = () => {
	return (
		<Grid item xs={12} sm={6}>
			<Button
				aria-label="newgame"
				color="primary"
				size="medium"
				// onClick={<Redirect to="/play" />}
				endIcon={<DoubleArrowIcon />}
			>
				PLAY NOW
			</Button>
		</Grid>
	);
};

export default class NewHome extends Component {
	constructor() {
		super();
		this.state = { isHovering: false };
	}

	componentDidMount() {
		/* PODCAST */
		const script = document.createElement('script');
		script.src = 'https://apps.elfsight.com/p/platform.js';
		script.async = true;
		document.body.appendChild(script);
	}

	render() {
		return (
			<div id="new-home">
				<header className="header">
					<div className="container-header">
						<div className="logo" />
						{/* <a className="logo">C O N Q U E R &ensp; 2 . 0</a> */}
						{/* <div className="user-panel">
							<LoginButton />
							&ensp; | &ensp;
							<a href="#">Register</a>
						</div> */}
					</div>
					<div />
				</header>

				{/* ----- HEADER ----- */}

				<section className="v-header container">
					<div className="fullscreen-video-wrap">
						<video muted autoPlay loop src={videoSource} alt="VIDEO" />
					</div>
					<div className="header-overlay">
						<div className="header-overlay-wrapper">
							<div className="overlay-text">
								<div className="overlay-title">
									<h2>CONQUER 2.0</h2>
									<h3>Beta Version 2 Out Now</h3>
									{/* {!signedIn ? <LoginButton /> : <LogoutButton />} */}
									<Button
										variant="outlined"
										color="secondary"
										href="/play"
										endIcon={<DoubleArrowIcon />}
									>
										PLAY NOW
									</Button>
								</div>
								<div className="play-now">{/* <h6>Gamebox here??</h6> */}</div>
							</div>
						</div>
					</div>
				</section>

				{/* ----- NEWS ----- */}

				<section className="jumbo-bar">
					<div className="bottom-jumbo-bar-left">LATEST NEWS</div>
					<div className="bottom-jumbo-bar-right">
						<div className="marquee">
							<div className="marqueeContent">
								<Testimonials />
							</div>
						</div>
					</div>
				</section>

				{/* ----- MEDIA ----- */}

				<section className="media">
					<div className="media-col">
						<div className="media-col-1-row-1">
							<div className="domino-title">
								<p style={{ textAlign: 'center', fontSize: '20px', padding: '0px' }}>
									DOMINO MEMES &copy;
								</p>
							</div>
							<div className="meme-wrapper">
								<img src={Meme} className=" inner-img" />

								<div className="meme-rating">
									<MemeRating />
								</div>
							</div>
						</div>
						<div className="media-col-1-row-2">
							<PollBox />
						</div>
					</div>
					<div className="media-col">
						<div className="media-col-2-row-1">
							{/* <img src={MapImage} /> */}
							<div className="media-overlay">
								<h2>New Map Released</h2>
							</div>
						</div>
						<div className="media-col-2-row-2">
							<span
								style={{
									textAlign: 'center',
									borderRadius: '10px'
								}}
							>
								<iframe
									src="https://scratch.mit.edu/projects/22111881/embed/?autostart=false"
									allowtransparency="true"
									width="485"
									height="402"
									frameborder="0"
									scrolling="no"
									allowfullscreen
								/>
							</span>
						</div>
					</div>
					<div className="media-col-3">
						<div className="latest-news">
							<div className="news-content-wrapper">
								get the latest news
								<hr />
								<RSSFeedGameSpot />
							</div>
						</div>
					</div>
				</section>

				<section style={{ marginTop: '2vh' }}>
					<hr style={{ borderColor: '#1313213' }} />
				</section>

				<section className="next-update">
					<img src={NextUpdateBanner} />
					{/* <button className="play-now">play now ➤</button> */}
				</section>
				{/* <section className="carousel-latest-updates">
					<Slideshow />
				</section> */}

				<section className="new-features">
					<div className="compatible-all-devices" />
					<div className="compatible-side-text" />
				</section>

				<footer className="footer">
					<div className="credits">
						<span> Conquer 2.0 by Imperium Games &copy;</span>
					</div>
				</footer>
			</div>
		);
	}
}

const Footer = () => {
	return (
		<footer>
			<strong>Conquer 2.0 by Imperium Games</strong>
		</footer>
	);
};
