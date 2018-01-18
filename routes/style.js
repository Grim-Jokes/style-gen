var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var config = require('../config');
var glob = require('glob');

router.get('/combined.css', function (req, res, next) {
  var paths = glob.sync(config.stylesheetsPath + '**/*').filter(x => !x.endsWith('.css'));

  var result = {}

  paths.forEach((dirname) => {
    fs.readdirSync(dirname).filter(x => {
      return !x.startsWith('_') && !x.startsWith('.')
    }).forEach((fileName) => {
      var fullPath = path.resolve(dirname, fileName);
      result[fullPath] = fs.readFileSync(fullPath);
    });
  });

  file = ''

  Object.keys(result).forEach((filePath, index) => {
    var header = "/*" + filePath + "*/\n\n";

    if (index != 0) {
      header = '\n\n' + header;
    }

    file += header

    file += result[filePath];
  });

  res.writeHead(200, {
    "Content-Type": "text/css",
    "Content-Length": file.length
  });
  res.write(file);
  res.end();
});

module.exports = router;