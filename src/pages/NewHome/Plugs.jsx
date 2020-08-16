import React, { useState } from 'react';
import ReactStars from 'react-rating-stars-component';
import Slide1 from '../../media/NextUpdate.jpg';

import './NewHome.css';

const Testimonials = () => {
	return (
		<h2>
			Conquer V2.5 brought to you by Imperium Games. Our Recent Testimonials:{' '}
			<strong style={{ color: '#ff5420' }}>"Damn Harry where'd you find this, screw Quidditch"</strong> - JK
			Rowling; &ensp; <strong style={{ color: '#ff5420' }}>"This can't be fake news at all"</strong> - Donald J.
			Trump &ensp;{' '}
			<strong style={{ color: '#ff5420' }}>
				"Whoever made dis joint... damn give dem some sorta prize man"
			</strong>{' '}
			- Sn00p DoGG &ensp;{' '}
			<strong style={{ color: '#ff5420' }}>
				"I hate this place. It's soo good you will come back every day, it ruined my social life cause each
				night I only want to go there.. I hate this place!!"
			</strong>{' '}
			- Barbara Streisand &ensp;{' '}
			<strong style={{ color: '#ff5420' }}>
				"After playing Conquer for ages, I feel like my transformation is complete. I totally identify as an
				attack helicopter and my pronouns are Chopper and John Cena. I feel like I have completely completed the
				completion of my duty"
			</strong>{' '}
			- SJW Committee &ensp;
			<strong style={{ color: '#ff5420' }}>
				"Awhile back my wife Karen divorced me and took the kids. I got really depressed since she won custody
				and wont let me see 'em. But once I saw one of the many amazing ads I tried Conquer 2 out and am already
				lvl 37 god tier. Im no longer depressed once my ex saw what level i was she remarried me and I get to
				see my kids again. 5/5 best game ever."
			</strong>{' '}
			- Kieran Breen
		</h2>
	);
};

const Radar = () => {
	return (
		<div className="gamebox" styles={{ backgroundColor: 'black' }}>
			<div className="radar">
				<div className="pointer" />
				<div className="shadow" />
			</div>
		</div>
	);
};

const RSSFeedGameSpot = () => {
	return (
		<div id="widgetmain" className="rss-wrapper">
			<iframe
				src="http://us1.rssfeedwidget.com/getrss.php?time=1597506338687&amp;x=https%3A%2F%2Fwww.eurogamer.net%2F%3Fformat%3Drss&amp;w=200&amp;h=500&amp;bc=333333&amp;bw=0&amp;bgc=transparent&amp;m=5&amp;it=false&amp;t=(default)&amp;tc=FF5420&amp;ts=15&amp;tb=transparent&amp;il=true&amp;lc=FF5420&amp;ls=14&amp;lb=true&amp;id=true&amp;dc=FFFFFF&amp;ds=14&amp;idt=true&amp;dtc=FFFFFF&amp;dts=12"
				id="rssOutput"
			/>
		</div>
	);
};

const Podcast = () => {
	return <div className="elfsight-app-988f62ad-adcd-4565-928d-b88b8d689eb8" />;
};

const PollBox = () => {
	return (
		<div className="poll-box-stl">
			<form method="post" action="https://poll.pollcode.com/58475991">
				<div
					style={{
						boxShadow: '0px 0px 5px #888',
						padding: '5px',
						borderRadius: '10px'
					}}
				>
					<div style={{ textAlign: 'left' }}>What is the most OP continent in Conquer 2.0?</div>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={1} id="answer584759911" style={{ float: 'left' }} />

					<label htmlFor="answer584759911" style={{ float: 'left' }}>
						North America
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={2} id="answer584759912" style={{ float: 'left' }} />
					<label htmlFor="answer584759912" style={{ float: 'left' }}>
						South America
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={3} id="answer584759913" style={{ float: 'left' }} />
					<label htmlFor="answer584759913" style={{ float: 'left' }}>
						Africa
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={4} id="answer584759914" style={{ float: 'left' }} />
					<label htmlFor="answer584759914" style={{ float: 'left' }}>
						Europe
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={5} id="answer584759915" style={{ float: 'left' }} />
					<label htmlFor="answer584759915" style={{ float: 'left' }}>
						Asia
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={6} id="answer584759916" style={{ float: 'left' }} />
					<label htmlFor="answer584759916" style={{ float: 'left' }}>
						Oceania
					</label>
					<div style={{ clear: 'both' }} />
					<input type="radio" name="answer" defaultValue={7} id="answer584759917" style={{ float: 'left' }} />
					<label htmlFor="answer584759917" style={{ float: 'left' }}>
						Antarctica
					</label>

					<div align="center" style={{ padding: '3px' }}>
						<input
							type="submit"
							defaultValue=" Vote "
							style={{
								borderRadius: '10px',
								color: '#ff4520',
								padding: '6px 32px',
								textAlign: 'center',
								textDecoration: 'none',
								display: 'inline-block',
								fontSize: '16px',
								transitionDuration: '0.4s'
							}}
						/>
					</div>
				</div>
			</form>
		</div>
	);
};

function MemeRating() {
	const [ rated, setrated ] = useState(false);
	const [ avgrating, setavgrating ] = useState(0);

	const ratingChanged = (newRating) => {
		//TODO: Link with firebase db
		setrated(true);
		setavgrating(newRating);
	};
	//TODO: Connect ratings with firebase
	return (
		<div>
			{!rated ? (
				<div className="rating">
					<ReactStars
						count={5}
						onChange={ratingChanged}
						size={24}
						activeColor="#ffd700"
						style={{ marginBottom: '10px' }}
					/>
				</div>
			) : (
				<h5>Thanks for Rating! Avg Rating: {avgrating}</h5>
			)}
		</div>
	);
}

export { PollBox, MemeRating, Testimonials, Radar, RSSFeedGameSpot, Podcast };
