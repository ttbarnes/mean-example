// modules =================================================
var express            = require('express');
var app                = express();
var morgan             = require('morgan')
var mongoose           = require('mongoose');
var bodyParser         = require('body-parser');
var methodOverride     = require('method-override');
var dotenv             = require('dotenv').load();

// configuration ===========================================

var routes         = require('./api/routes');

var port = process.env.port;
mongoose.connect(process.env.db_url);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public/src')); // set the static files location

//enable server logging
app.use(morgan('dev'));

// register api routes
// all of our routes will be prefixed with /api
app.use('/api', routes);

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('Server running on port ' + port);
exports = module.exports = app;  // expose app