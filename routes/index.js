var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function (req, res, next) {

  const sections = fs.readdirSync(config.templates)
    .filter(x => path.extname(x) == '')
    .filter(x => !x.startsWith('.'))

  res.render('index', {
    title: 'Style Guide',
    templates: sections
  });
});

function isDirectory(source) {
  return fs.lstatSync(source.path).isDirectory();
}

function isFile(source) {
  return fs.lstatSync(source.path).isFile();
}

function readDir(source) {
  return fs.readdirSync(source).map(name => {
    return {
      path: path.join(source, name),
      name
    }
  });
}

function getDirectories(source) {
  return readDir(source).filter(isDirectory);
}

function getFiles(source) {
  return readDir(source).filter(isFile);
}

router.get('/:field', function (req, res, next) {

  if (req.params.field.endsWith('.ico')) {
    return res.next();
  }

  var fieldPath = path.resolve(config.templates, req.params.field);

  let ids = getFiles(fieldPath).filter(x=>!x.name.startsWith('_') && !x.name.startsWith('.'))
  ids = ids.map(x=> x.name.replace('.html', '')).join(',');

  var templates = getDirectories(config.templates).map(x => x.name);
  
  const result = glob.sync(config.stylesheetsPath + '/**/*');


  const privateStyles = result.filter(x => !fs.lstatSync(x).isDirectory())
    .filter(x => path.basename(x).startsWith('_'))
    .map(x => x.replace(config.stylesheetsPath, 'stylesheets'))

  res.render('content', {
    ids,
    templates,
    privateStyles,
    folderName: req.params.field
  })
});

module.exports = router;