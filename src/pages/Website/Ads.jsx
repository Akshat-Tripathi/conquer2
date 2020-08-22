import React from 'react';
import CompatibleBrowsers from '../../media/CompatibleBrowsers.jpg';
import AllBrowsers from '../../media/AllDevices.png';
import './Ads.css';

function Ads() {
	return (
		// <div className="self-ads">
		// 	<div className="self-ads-grid">
		// 		<div className="all-browsers" />
		// 		<div className="compatible-devices" />

		// 	</div>
		// </div>

		<div className="ads">
			<div className="ads-title">
				<h1>Supported Browsers</h1>
				<p>Now play on any browser anytime, anywhere, without the hassle</p>
			</div>
			<div className="ads-wrapper">
				<div>
					<i class="fab fa-chrome icon" />
					<h3>Chrome</h3>
				</div>
				<div>
					<i class="fab fa-safari icon" />
					<h3>Safari</h3>
				</div>
				<div>
					<i class="fab fa-firefox icon" />
					<h3>Firefox</h3>
				</div>
				<div>
					<i class="fab fa-edge icon" />
					<h3>Edge</h3>
				</div>
			</div>
		</div>
	);
}

export default Ads;
