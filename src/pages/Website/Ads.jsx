import React from 'react';
import CompatibleBrowsers from '../../media/CompatibleBrowsers.jpg';
import AllBrowsers from '../../media/AllDevices.png';
import './Ads.css';

function Ads() {
	return (
		<div className="self-ads">
			<div className="self-ads-grid">
				<div className="all-browsers" />
				<div className="compatible-devices" />

				{/* <div className="compatible-devices">IMAGE 1</div> */}
				{/* <figure className="all-devices">
					<img src={CompatibleBrowsers} />
				</figure>
				<figure className="compatible-browsers">
					<img src={AllBrowsers} />
				</figure> */}
				{/* <div className="all-browsers">IMAGE 2</div> */}
			</div>
		</div>
	);
}

export default Ads;
