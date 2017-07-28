var https = require('https');
var fs = require('fs');
var path = require('path');
const express = require('express');

const app = express();
app.set('view engine', 'ejs');

var options = {
    key: fs.readFileSync(path.join('/','var','www','sslforfree','private.key')),
    cert: fs.readFileSync(path.join('/','var','www','sslforfree','certificate.crt'))
}

app.get('/',function(req,res){
    res.end("OK!");
});

const server = https.createServer(options,app);

server.listen(process.env.npm_package_config_port, function() {
    console.log("Server listening on port " + process.env.npm_package_config_port);
});