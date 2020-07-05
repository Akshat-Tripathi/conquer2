/* ExpressJS router for cloud API endpoints */

var express = require('express');
var router = express.Router();

var actionService = require('./action-service');

router.get('/action', function(req, res, next) {
	actionService.get(req, res);
});
