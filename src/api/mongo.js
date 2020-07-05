/* Connect to MongoDB Atlas via NL Azure */

const mongoose = require('mongoose');
const env = require('./environment');

mongoose.Promise = global.Promise;

const mongoUri = `mongodb://${env.dbName}:${env.key}@${env.host}:${env.port}/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@${env.dbName}@`;

function connect() {
	return mongoose.connect(mongoUri, { useMongoClient: true });
}

module.exports = {
	connect,
	mongoose
};
