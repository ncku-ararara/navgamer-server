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
const { IO } = require('./server/io');
const { IOService } = require('./server/io_service');
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
app_s.use(express.static(path.join(__dirname,'client/elements')));
app_s.use(express.static(path.join(__dirname,'client/images')));
app_s.use(express.static(path.join(__dirname,'client/css')));
app_s.use(express.static(path.join(__dirname,'client/js')));
app_s.use(express.static(path.join(__dirname,'client/lib')));

/* ssl usage */
var options = {
    key: fs.readFileSync(path.join('/','var','www','sslforfree','private.key')),
    cert: fs.readFileSync(path.join('/','var','www','sslforfree','certificate.crt'))
}

/* Initialize all module */
/* Need to separate "Secure service" & "Download Service" */


const secure_server = https.createServer(options,app_s);
const download_server = http.createServer(app);

/* Both (Secure & Download), often for testbed or introduction */
Debugger.init(app);
Debugger.init(app_s);
IntroService.init(app);
IntroService.init(app_s);
/* Special for https */
IO.init(secure_server);
IOService.init(app_s);
/* 2 Server create! */

secure_server.listen(process.env.npm_package_config_secure_port, function() {
    console.log("Secure Server listening on port " + process.env.npm_package_config_secure_port);
});

download_server.listen(process.env.npm_package_config_download_port, function() {
    console.log("Download Server listening on port " + process.env.npm_package_config_download_port);
});