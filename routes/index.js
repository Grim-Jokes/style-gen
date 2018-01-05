var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function (req, res, next) {

  const sections = fs.readdirSync(config.templates).filter(x => path.extname(x) == '')

  res.render('index', {
    title: 'Style Guide',
    templates: sections
  });
});

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
  })

  res.end();
});

router.get('/:field', function (req, res, next) {
  const p = path.resolve(config.templates, req.params.field)
  let f = fs.readdirSync(p).filter(x => !x.startsWith('._'));
  let ids = f.map(x => {
    return path.basename(x)
      .substring(0, x.length - '.html'.length);
  });

  const pug_p = path.resolve(__dirname, '../views/');

  const result = glob.sync(config.stylesheetsPath + '/**/*');

  ids = ids.join(',');
  allStyles = result.filter(x => !fs.lstatSync(x).isDirectory())
    .map(x => x.replace(config.stylesheetsPath, 'stylesheets'))

  f = fs.readdirSync(pug_p).find(x => {
    return path.basename(x) === req.params.field + '.pug'
  });

  if (f) {
    res.render(req.params.field, {
      ids,
      allStyles,
      folderName: req.params.field
    })
  } else {
    res.render('content', {
      ids,
      allStyles,
      folderName: req.params.field
    })
  }
});

module.exports = router;