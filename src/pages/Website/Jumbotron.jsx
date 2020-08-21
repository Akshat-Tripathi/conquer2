import React from 'react';
import { Button } from './Button';
import './Jumbotron.css';
import Fireball from '../../media/fireball.mp4';
import BkgVid from '../../media/video.mp4';

function Jumbotron() {
	return (
		<div className="hero-container">
			<video src={BkgVid} autoPlay loop muted />
			<h1 style={{ textShadow: '4px 4px #ff4520' }}>CONQUER 2.0</h1>
			<p style={{ textShadow: '0 0 10px #fff' }}>Version Beta 2 Out Now</p>
			<div className="hero-btns">
				<Button className="btns" buttonStyle="btn--outline" buttonSize="btn--large" link="/play">
					INITIATE CONQUEST
				</Button>
				<Button className="btns" buttonStyle="btn--primary" buttonSize="btn--large" link="/game_intro">
					THE ALMANAC
					<i className="far fa-play-circle" />
				</Button>
			</div>
		</div>
	);
}

export default Jumbotron;
