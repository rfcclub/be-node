// Main js file for server-side
// normal constants
const DEFAULT_PORT = 4000;
const DEFAULT_HOST = 'localhost';
const db = require('./db'); // eslint-disable-line

// express related
const express = require('express');
const bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
const fileUpload = require('express-fileupload'); // eslint-disable-line
const rewrite = require('express-urlrewrite');
const path = require('path');
const fs = require('fs-extra'); // eslint-disable-line

// express is the routing engine most commonly used with nodejs
var server = express();
// Set public folder as root
server.use(express.static(__dirname));
// add support for file upload
server.use(fileUpload());

fs.readdirSync(__dirname).forEach(file => {
  if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
    server.use(rewrite('/' + file + '/*', '/' + file + '/index.html'));
  }
});

// tell the router to parse urlencoded data and JSON data for us
// and put it into req.query/req.body
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(bodyParser.json());
server.use(cookieSession({
  name: 'session',
  keys: ['Iam', 'thelaziest']
}));

const port = process.env.PORT || DEFAULT_PORT;
const host = process.env.IP || DEFAULT_HOST;

// set up the expressjs server and start it running
server.listen(port, host, function () {
  console.log('Server started at', host + ':' + port);
});

// we create our router here
var router = require('./routes/main');

// apply the routes to our application
server.use('/', router);
