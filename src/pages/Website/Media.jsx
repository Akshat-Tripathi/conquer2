import React, { Component } from 'react';
import './Media.css';
import CanvasJSReact from '../../assets/canvasjs.react';

import Map from '../../media/conquer2.jpg';
import Meme from '../../media/DominoMemes/meme1.jpeg';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';

function Media() {
	return (
		<div className="media">
			<div className="media-title">
				<h1> Conquer 2.0 Propaganda Hub</h1>
			</div>
			<div className="media-grid">
				<div className="tl">
					<header>
						<p>
							<a href="/memes">DOMINO MEMES</a>
						</p>
					</header>
				</div>
				<div className="mt">
					<header>
						<h1>
							{/* TODO: Fix Link */}
							<a href="">
								<i
									class="fas fa-globe-americas"
									style={{ color: '#ff4520', fontSize: '50px' }}
								/>&ensp;NEW MAP RELEASED
							</a>
						</h1>
					</header>
				</div>
				<div className="r">
					<h1>Latest Victors</h1>
					<hr />
					<p>
						<small>Game ID: ??</small>
					</p>
					<ul>
						<li>
							<i class="fas fa-medal" style={{ color: '#ffdf00', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
						<li>
							<i class="fas fa-medal" style={{ color: '#a7a7ad', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
						<li>
							<i class="fas fa-medal" style={{ color: '#824A02', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
					</ul>
					<p>
						<small>Game ID: ??</small>
					</p>

					<ul>
						<li>
							<i class="fas fa-medal" style={{ color: '#ffdf00', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
						<li>
							<i class="fas fa-medal" style={{ color: '#a7a7ad', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
						<li>
							<i class="fas fa-medal" style={{ color: '#824A02', fontSize: '50px' }} /> <h2>Angelo</h2>
						</li>
					</ul>
				</div>
				<div className="bl">
					<div className="" styles={{ height: '100%', width: '100%' }}>
						<Graph />
					</div>
					{/* <header>
						<p>DO YOU HAVE WHAT IT TAKES TO BE A CONQUEROR?</p>
					</header> */}
				</div>
				<div className="mb">
					<iframe
						width="560"
						height="365"
						src="https://www.youtube.com/embed/5YRbeA31W-M"
						frameborder="0"
						allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
						allowfullscreen
					/>
					{/* <header>
						<p>YT</p>
					</header> */}
				</div>
			</div>
		</div>
	);
}

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

class Graph extends Component {
	render() {
		const options = {
			theme: 'dark2',
			animationEnabled: true,
			exportFileName: 'Favourite Stronghold Continents',
			exportEnabled: false,
			title: {
				text: 'Favourite Stronghold Continents'
			},
			data: [
				{
					type: 'pie',
					showInLegend: false,
					legendText: '{label}',
					toolTipContent: '{label}: <strong>{y}%</strong>',
					indexLabel: '{y}%',
					indexLabelPlacement: 'inside',
					dataPoints: [
						{ y: 32, label: 'Africa' },
						{ y: 22, label: 'South America' },
						{ y: 15, label: 'Oceania' },
						{ y: 19, label: 'Antarctica' },
						{ y: 5, label: 'North America' },
						{ y: 7, label: 'Europe' },
						{ y: 7, label: 'Asia' }
					]
				}
			]
		};

		return (
			<div>
				<CanvasJSChart
					options={options}
					/* onRef={ref => this.chart = ref} */
				/>
				{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
			</div>
		);
	}
}

export default Media;
