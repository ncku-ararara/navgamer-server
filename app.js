/* library */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
/* core */
const { Debugger } = require('./server/debug');
const { IntroService } = require('./server/intro');
const { DB } = require('./server/db');
/* define app(2 for secure & download) */
const app = express(),app_s = express();
app.set('view engine', 'ejs');
app_s.set('view engine','ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app_s.use(bodyParser.urlencoded({
	extended: true
}));
app_s.use(bodyParser.json());

/* redirect & static link */
app_s.set('views',path.join(__dirname,'client/views'));
app_s.use(express.static('client/elements'));
app_s.use(express.static('client/img'));
app_s.use(express.static('client/css'));
app_s.use(express.static('client/js'));
app_s.use(express.static('client/lib'));

/* ssl usage */
var options = {
    key: fs.readFileSync(path.join('/','var','www','sslforfree','private.key')),
    cert: fs.readFileSync(path.join('/','var','www','sslforfree','certificate.crt'))
}

/* Initialize all module */
/* Need to separate "Secure service" & "Download Service" */

/* Both (Secure & Download), often for testbed or introduction */
Debugger.init(app);
Debugger.init(app_s);
IntroService.init(app);
IntroService.init(app_s);
/**/

/* 2 Server create! */
const secure_server = https.createServer(options,app_s);
const download_server = http.createServer(app);

secure_server.listen(process.env.npm_package_config_secure_port, function() {
    console.log("Secure Server listening on port " + process.env.npm_package_config_secure_port);
});

download_server.listen(process.env.npm_package_config_download_port, function() {
    console.log("Download Server listening on port " + process.env.npm_package_config_download_port);
});