import React from 'react';
import Footer from '../Footer';
import Media from '../Media';
import Jumbotron from '../Jumbotron';
import Navbar from '../Header';
import Ads from '../Ads';
import Timeline from '../Timeline';
import ChatPopup from '../../Map/ChatPopup';

function Home() {
	return (
		<div>
			<Navbar />
			<Jumbotron />
			<Media />
			<Ads />
			<Timeline />
			{/* <ChatPopup /> */}
			<Footer />
		</div>
	);
}

export default Home;
