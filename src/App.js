import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './App.css';
import OldHome from './pages/Home/Home';
import { UnderConstruction } from './pages/Extra/UnderConstruction';
import GameMap from './pages/Map/Map';
import Intro2 from './shashgonenuts/intro2';
import ErrorPage from './pages/Extra/Error';
import Redirector from './pages/Extra/Redirector';
import WaitingRoom from './pages/Map/WaitingRoom';
import Home from './pages/Website/Pages/Home';
import StartGameBox from './pages/Home/StartGameBox';
import VectorMap from './pages/Map/VectorMap';
import Forums from './pages/Website/Pages/Forums';
import DominoMemes from './pages/Website/Pages/DominoMemes';
import Play from './pages/Website/Pages/Play';
import SideBar from './pages/Map/SideBar';
import { Sidebar } from './pages/Map/Components/Sidebar';
import ComingSoon from './pages/Website/ComingSoon/ComingSoon';

class App extends React.Component {
	render() {
		return (
			<React.Fragment>
				<Router>
					<Switch>
						{/* Website */}
						<Route exact path="/" component={Home} />
						<Route path="/memes" component={DominoMemes} />
						<Route path="/forums" component={ComingSoon} />
						<Route path="/play" component={Play} />
						<Route path="/tutorial" component={ComingSoon} />
						<Route path="/signup" component={ComingSoon} />

						{/* Game */}
						<Route path="/map" component={GameMap} />
						<Route path="/game" component={GameMap} />
						<Route path="/lobby" component={WaitingRoom} />

						{/* Extras */}
						<Route path="/game_intro" component={Redirector} />
						<Route path="/error" component={ErrorPage} />
						<Route path="/underdev" component={UnderConstruction} />

						{/* ALPHA TESTING PURPOSES ONLY. PROHIBIT PUBLIC ACCESS*/}
						<Route path="/alpha" component={SideBar} />
						<Route path="/sidebar/test" component={Sidebar} />
					</Switch>
				</Router>
			</React.Fragment>
		);
	}
}

export default App;
