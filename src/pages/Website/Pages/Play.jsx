import React from 'react';
import './Play.css';
import Logo from '../../../media/conquer2logo.png';
import StartGameBox from '../StartGameBox';
import Preloader from '../ComingSoon/Preloader/Preloader';

function Play() {
	return (
		<div className="play-wrapper">
			<header>
				<img src={Logo} />
				<h6 style={{ color: 'white' }}>By Imperium Games &copy;</h6>
			</header>
			<div className="gamebox">
				<StartGameBox />
				{/* Sign In here */}
			</div>
			<Preloader/>
		</div>
	);
}

export default Play;
