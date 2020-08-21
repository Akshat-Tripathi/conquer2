import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './App.css';
import OldHome from './pages/Home/Home.jsx';
import { UnderConstruction } from './pages/Extra/UnderConstruction';
import GameMap from './pages/Map/Map.jsx';
import Intro2 from './shashgonenuts/intro2.jsx';
import ErrorPage from './pages/Extra/Error.jsx';
import Redirector from './pages/Extra/Redirector.jsx';
import WaitingRoom from './pages/Map/WaitingRoom';
import Home from './pages/Website/Pages/Home';
import StartGameBox from './pages/Home/StartGameBox';
import Forums from './pages/Website/Pages/Forums';
import DominoMemes from './pages/Website/Pages/DominoMemes';
import Play from './pages/Website/Pages/Play';

class App extends React.Component {
	render() {
		return (
			<React.Fragment>
				<Router>
					<Switch>
						<div>
							{/* Website */}
							<Route exact path="/" component={Home} />
							<Route path="/home" component={OldHome} />
							<Route path="/memes" component={DominoMemes} />
							<Route path="/forums" component={Forums} />
							<Route path="/play" component={Play} />

							{/* Game */}
							<Route path="/map" component={GameMap} />
							<Route path="/game" component={GameMap} />
							<Route path="/lobby" component={WaitingRoom} />

							{/* Extras */}
							<Route path="/game_intro" component={Redirector} />
							<Route path="/error" component={ErrorPage} />
							<Route path="/underdev" component={UnderConstruction} />

							{/* ALPHA TESTING PURPOSES ONLY. PROHIBIT PUBLIC ACCESS*/}
							<Route path="/alpha" component={Intro2} />
						</div>
					</Switch>
				</Router>
			</React.Fragment>
		);
	}
}

export default App;
