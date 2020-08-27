import React from 'react';
import './Timeline.css';

function Timeline() {
	return (
		<div className="timeline-wrapper">
			<h1>The Wonderful History Of Conquer</h1>
			<div className="timeline">
				<div className="container left">
					<div className="content">
						<h2>Summer 2019</h2>
						<h4 style={{ color: '#ff4520' }}>
							<em>The Spark of Life</em>
						</h4>
						<p>
							Akshat and his brother embark on Conquer 1.0, the first conquer game ever made. This set a
							new precedent of a suite of new conquer games that the world was waiting to discover.
						</p>
					</div>
				</div>
				<div className="container right">
					<div className="content">
						<h2>Winter 2019</h2>
						<h4 style={{ color: '#ff4520' }}>
							<em>Games Night Every Night</em>
						</h4>
						<p>
							As new friendships were made and new alliances were forged, the wars of Conquer spread like
							the winter blizzard throughout Tizard. Players dominated and grew fearless of their enemies,
							overconfident in the fastest-clicker-takes-all mayhem.{' '}
						</p>
					</div>
				</div>
				<div className="container left">
					<div className="content">
						<h2>Spring 2020</h2>
						<h4 style={{ color: '#ff4520' }}>
							<em>Pandemic Pandemonium</em>
						</h4>
						<p>
							COVID-19 joined the game, and wiped out all to take the victory royale. It was time for a
							change and Shashwat joined Akshat in the quest for a new Conquer that could defeat COVID-19
							in the players' thirst for a crusade against boredom.{' '}
						</p>
					</div>
				</div>
				<div className="container right">
					<div className="content">
						<h2>Summer 2020</h2>
						<h4 style={{ color: '#ff4520' }}>
							<em>A New Chapter</em>
						</h4>
						<p>
							As countries struggled to develop the COVID-19 vaccine, Shashwat and Akshat perfected the
							antidote to COVID-19 by way of perfecting Conquer 2, opening up new realms and passages of
							tactics, alliances, and game dynamics never seen before in Conquer's history. Players would
							need to adapt to the modern Conquer 2.0 warfare.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Timeline;
