var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('add', {
    title: 'Add new section'
  });
});

router.post('/', function(req, res, next) {

  if (!req.body.sectionName)
    return res.render('add', {
      error: "Section name is empty"
    });

  const newPath =  path.resolve(config.stylesheetsPath, req.body.sectionName);
  const newTemplatePatth = path.resolve(config.templates, req.body.sectionName);

  if (fs.existsSync(newPath)) {
    return res.render('add', {
      error: "Stylesheet entry already exists!"
    });
  }
  else if (fs.existsSync(newTemplatePatth)) {
    return res.render('add', {
      error: "Template entry already exists!"
    });
  }

  fs.mkdirSync(newPath);
  fs.mkdirSync(newTemplatePatth);

  res.render('add', {});
});

module.exports = router;