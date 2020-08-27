import React from 'react';
import Footer from '../Footer';
import Media from '../Media';
import Jumbotron from '../Jumbotron';
import Navbar from '../Header';
import Ads from '../Ads';
import Timeline from '../Timeline';

function Home() {
	return (
		<div>
			<Navbar />
			<Jumbotron />
			<Media />
			<Ads />
			<Timeline />
			<Footer />
		</div>
	);
}

export default Home;
