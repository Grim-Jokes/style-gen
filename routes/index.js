var express = require('express');
var fs = require('fs');
var router = express.Router();
var base = require('./base');
var path = require('path');

const {
  getAllFiles
} = base;

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Style Guide'
  });
});

router.get('/:field', function (req, res, next) {
  const p = path.resolve(__dirname, '../public/templates/', req.params.field)
  f = fs.readdirSync(p).filter(x => !x.startsWith('._'));
  ids = f.map(x => {
    return path.basename(x)
      .substring(0, x.length - '.html'.length);
  });

  console.log(f);

  const pug_p = path.resolve(__dirname, '../views/')

  const allStyles = getAllFiles(path.resolve(__dirname, '../public/stylesheets'), (err, result) => {
    f = fs.readdirSync(pug_p).find(x => {
      return path.basename(x) === req.params.field + '.pug'
    });

    result = result
      .filter(x => x.endsWith('.css'))
      .filter(x => !path.basename(x).startsWith('._'))
      .filter(x => path.basename(x) != '.css')
      .map(
        x => x.replace(path.resolve(__dirname, '../public'), '')
      );

    ids = ids.join(',')

    if (f) {
      res.render(req.params.field, {
        ids,
        allStyles: result,
      })
    } else {
      res.render('content', {
        ids,
        allStyles: result
      })
    }
  });
});

router.get('/dl', function (req, res, next) {
  getAllFiles('public/stylesheets', (err, files) => {

    files = files.filter(x => x.endsWith('.css'))
    files = files.filter(x => path.basename(x) != '.css')

    let file = '';

    files.forEach((currentFile, index) => {

      if (index == 0) {
        file += '/*' + currentFile + '*/\n\n'
      } else {
        file += '\n\n/*' + currentFile + '*/\n\n'
      }

      currentStyle = fs.readFileSync(currentFile);

      file += currentStyle;
    });

    var filestream = fs.createReadStream(file);

    const f = __dirname + '/style.css'

    fs.writeFileSync(f, file)

    res.download(f);

  });




});

module.exports = router;