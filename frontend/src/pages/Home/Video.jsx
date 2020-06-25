import React, { useEffect, useRef } from 'react';
import videoSource from '../../media/HomeBackgroundVideo.mp4';
import './Video.css';

function Video() {
	useEffect(() => {
		attemptPlay();
	}, []);
	const videoEl = useRef(null);
	const attemptPlay = () => {
		videoEl &&
			videoEl.current &&
			videoEl.current.play().catch((error) => {
				console.error('Error attempting to play', error);
			});
	};
	return (
		<div className="video">
			<video muted autoPlay className="home-video" id="home-video">
				<source playsInline src={videoSource} type="video/mp4" alt="This is Sparta!" />
				What kind of browser version are you on... Your browser unfortunately does not yet support the video
				tag!
			</video>
		</div>
	);
}

export default Video;
