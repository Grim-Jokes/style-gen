var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');

router.get('/add/:folderName', function (req, res, next) {
  res.render('add-files')
});

router.post('/add/:folderName', function (req, res, next) {
  let stylesheets = path.resolve(config.stylesheetsPath, req.params.folderName, req.body.fileName + '.css');
  let templates = path.resolve(config.templates, req.params.folderName, req.body.fileName + '.html');

  fs.closeSync(fs.openSync(stylesheets, 'a'));
  fs.closeSync(fs.openSync(templates, 'a'));

  res.writeHead(302, {
    location: '/' + req.params.folderName
  });

  res.end();
});

module.exports = router;