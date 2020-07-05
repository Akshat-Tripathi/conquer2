const Action = require('./action-model');
const ReadPreference = require('mongodb').ReadPreference;

require('./mongo').connect();

function get(req, res) {
	const docquery = Action.find({}).read(ReadPreference.NEAREST); //For now get nearest location DB server to user's
	docquery.exec().then((actions) => res.json(actions)).catch((err) => {
		res.status(500).send(err); // Send back server error code
	});
}

function create(req, res) {
	const { playerName } = req.body;

	const action = new Action({ playerName });
	action
		.save()
		.then(() => {
			res.json(action);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
}

function update(req, res) {
	const { playerName } = req.body;

	Action.findOne({ playerName })
		.then((action) => {
			action.playerName = playerName;
			// TODO: Add more fields here
			action.save().then(res.json(action));
		})
		.catch((err) => {
			res.status(500).send(err);
		});
}

function destroy(req, res) {
	const { playerName } = req.params;

	Action.findOneAndRemove({ playerName })
		.then((action) => {
			res.json(action);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
}

module.exports = { get, create, update, destroy };
