import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Paper, Grid, IconButton, Typography } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

const LoginButton = () => {
	const { loginWithRedirect } = useAuth0();

	return (
		<Grid item xs={12} sm={6}>
			<Button
				aria-label="newgame"
				color="secondary"
				size="large"
				onClick={() => loginWithRedirect()}
				endIcon={<DoubleArrowIcon />}
			>
				PLAY NOW
			</Button>
		</Grid>
	);
};

const LogoutButton = () => {
	const { logout } = useAuth0();
	return (
		<div>
			<Grid item xs={12} sm={6}>
				<Button
					aria-label="newgame"
					color="primary"
					size="medium"
					onClick={() => logout()}
					endIcon={<AddCircleIcon />}
				>
					PLAY NOW
				</Button>
			</Grid>
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
