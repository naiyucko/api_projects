'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongo = require('mongodb').MongoClient;
var cookieParser = require('cookie-parser');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var app = express();
app.use(cookieParser());

mongo.connect('mongodb://localhost:27017/clementinejs', function (err, db) {

    if (err) {
        throw new Error('Database failed to connect!');
    } else {
        console.log('MongoDB successfully connected on port 27017.');
    }

    app.use('/public', express.static(process.cwd() + '/public'));
    app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

    routes(app, db);
    
    app.post('/metadata/go', upload.single('the-file'), function (req, res, next) {
      res.json({'fileSize': req.file.size}); 
    });

    app.listen(8080, function () {
        console.log('Listening on port 8080...');
    });

});