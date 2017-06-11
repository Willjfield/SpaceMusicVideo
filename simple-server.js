var express = require('express');
var app = express();
const port = 9090;
app.use('/', express.static(__dirname)); // ← adjust
app.listen(port, function() { console.log('listening on port: '+port); });
