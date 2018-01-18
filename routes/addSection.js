var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('add-section', {
    title: 'Add new section'
  });
});

router.post('/', function(req, res, next) {
  if (!req.body.sectionName)
    return res.render('add-section', {
      error: "Section name is empty"
    });

  const sectionName = req.body.sectionName.toLowerCase();

  const newPath =  path.resolve(config.stylesheetsPath, sectionName);
  const newTemplatePatth = path.resolve(config.templates, sectionName);

  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath);
  }
  
  if (!fs.existsSync(newTemplatePatth)) {
    fs.mkdirSync(newTemplatePatth);
  }

  res.render('add-section', {});
});

module.exports = router;