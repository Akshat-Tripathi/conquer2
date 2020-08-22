import React from 'react';
import Header from '../Header';
import { Redirect, Link } from 'react-router-dom';

function Forums() {
	return (
		<div className="">
			<Header />
			<div className="forums-wrapper">
				<h1>Forums here</h1>
			</div>
		</div>
	);
}

// style="border:1px solid #000;"
export default Forums;
