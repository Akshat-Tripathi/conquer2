import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home.jsx';
import { UnderConstruction } from './pages/Extra/UnderConstruction';
import GameMap from './pages/Map/Map.jsx';
import Intro2 from './shashgonenuts/intro2.jsx';
import ErrorPage from './pages/Extra/Error.jsx';
import Redirector from './pages/Extra/Redirector.jsx';
import WaitingRoom from './pages/Map/WaitingRoom';
import NewHome from './pages/NewHome/NewHome';
// import Login from './pages/NewHome/Authentication';
import StartGameBox from './pages/NewHome/StartGameBox';

class App extends React.Component {
	render() {
		return (
			<React.Fragment>
				<Router>
					<Switch>
						<div>
							{/* Homepage */}
							<Route exact path="/" component={NewHome} />
							<Route path="/home" component={Home} />
							<Route path="/newhome" component={NewHome} />
							{/* <Route path="/login" component={Login} /> */}
							<Route path="/play" component={StartGameBox} />

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
