var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

/* GET home page. */
router.get('/', function (req, res, next) {
  const templates = fs.readdirSync(config.templates).filter(x => {
    const fullPath = path.resolve(config.templates, x)
    return fs.statSync(fullPath).isDirectory()
  });

  res.render('folders', {
    title: 'Add new section',
    templates
  });
});

router.get('/:folder', function (req, res, next) {
  templates = fs.readdirSync(path.resolve(config.templates, req.params.folder));

  res.render('folders', {
    title: 'Add new section',
    templates
  });
});

module.exports = router;