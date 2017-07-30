/* library */
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
/* core */
const { Debugger } = require('./server/debug');
const { IntroService } = require('./server/intro');
const { DB } = require('./server/db');
/* define app */
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

/* redirect & static link */
app.set('views',path.join(__dirname,'client/views'));
app.use(express.static('client/elements'));
app.use(express.static('client/img'));
app.use(express.static('client/css'));
app.use(express.static('client/js'));
app.use(express.static('client/lib'));

/* ssl usage */
var options = {
    key: fs.readFileSync(path.join('/','var','www','sslforfree','private.key')),
    cert: fs.readFileSync(path.join('/','var','www','sslforfree','certificate.crt'))
}

/* Initialize all module */
Debugger.init(app);
IntroService.init(app);

const server = https.createServer(options,app);

server.listen(process.env.npm_package_config_port, function() {
    console.log("Server listening on port " + process.env.npm_package_config_port);
});