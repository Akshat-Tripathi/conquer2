import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Paper } from '@material-ui/core';

const LoginButton = () => {
	const { loginWithRedirect } = useAuth0();

	return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

const LogoutButton = () => {
	const { logout } = useAuth0();

	return (
		<div>
			<Button style={{ backgroundColor: 'blue', borderRadius: '1%', boxShadow: '1%' }} onClick={() => logout()}>
				Log Out
			</Button>
		</div>
	);
};

const Profile = () => {
	const { user, isAuthenticated } = useAuth0();

	return (
		isAuthenticated && (
			<div>
				<img src={user.picture} alt={user.name} />
				<h2>{user.name}</h2>
				<p>{user.email}</p>
			</div>
		)
	);
};

export { LoginButton, LogoutButton, Profile };
