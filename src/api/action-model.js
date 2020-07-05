/* Defines the Schema of the action expected for the database */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const actionSchema = new Schema({
	id: { type: Number, required: true, unique: true },
	playerName: String
});

const Action = mongoose.model('Campaign', actionSchema);

module.exports = Action;
