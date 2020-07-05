const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const express = require('express');
const app = express();

/* RECORD ACTIONS */

app.get('/actions', (req, res) => {
	cors(req, res, () => {}); //CORS COMPLIANCE DO NOT TOUCH
	db
		.collection('actions')
		.orderBy('receipt_time', 'asc')
		.get()
		.then((data) => {
			let actions = [];
			data.forEach((doc) => {
				actions.push({
					actionId: doc.id,
					countryStates: doc.data().countryStates,
					playerTroops: doc.data().playerTroops,
					troopNumber: doc.data().troopNumber,
					countryNumber: doc.data().countryNumber,
					receipt_time: doc.data().receipt_time
				});
			});
			return res.json(actions);
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
});

app.post('/actions', (request, response) => {
	if (request.method !== 'POST') {
		return response.status(400).json({ error: 'Must be a POST method request.' });
	}

	const newAction = {
		countryStates: request.body.countryStates,
		playerTroops: request.body.playerTroops,
		troopNumber: parseFloat(request.body.troopNumber),
		countryNumber: parseFloat(request.body.countryNumber),
		receipt_time: admin.firestore.Timestamp.fromDate(new Date())
	};

	db
		.collection('actions')
		.add(newAction)
		.then((doc) => {
			return response.json({
				message: `Action commission note ${doc.id} created successfully on remote database.`
			});
		})
		.catch((error) => {
			response.status(500).json({ error: 'Something went wrong with pushing the data to the database.' });
			console.log(error);
		});
});

/* RECORD OF STATES */

app.get('/states', (req, res) => {
	cors(req, res, () => {}); //CORS COMPLIANCE DO NOT TOUCH
	db
		.collection('states')
		.orderBy('receipt_time', 'asc')
		.get()
		.then((data) => {
			let states = [];
			data.forEach((doc) => {
				states.push({
					statesId: doc.id,
					// color: doc.data().color,
					// troops: doc.data().troops,
					// countries: doc.data().countries,
					// password: doc.data().password,

					countryStates: doc.data().countryStates,
					playerTroops: doc.data().playerTroops,
					troopNumber: doc.data().troopNumber,
					countryNumber: doc.data().countryNumber,
					receipt_time: doc.data().receipt_time
				});
			});
			return res.json(states);
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
});

app.post('/states', (request, response) => {
	if (request.method !== 'POST') {
		return response.status(400).json({ error: 'Must be a POST method request.' });
	}

	const newState = {
		countryStates: request.body.countryStates,
		playerTroops: request.body.playerTroops,
		troopNumber: parseFloat(request.body.troopNumber),
		countryNumber: parseFloat(request.body.countryNumber),
		receipt_time: admin.firestore.Timestamp.fromDate(new Date())
	};

	db
		.collection('states')
		.add(newState)
		.then((doc) => {
			return response.json({ message: `State change note ${doc.id} created successfully on remote database.` });
		})
		.catch((error) => {
			response.status(500).json({ error: 'Something went wrong with pushing the data to the database.' });
			console.log(error);
		});
});

exports.api = functions.region('europe-west1').https.onRequest(app);
