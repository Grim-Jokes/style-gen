var express = require('express');
var fs = require('fs');
var router = express.Router();
var base = require('./base');
var path = require('path');

const { getAllFiles } = base;

var appRouter = require('../app')._router;

/* GET home page. */
router.get('/', function(req, res, next) {  
  res.render('index', { title: 'Style Guide' });
});

router.get('/dl', function(req, res, next) {
  getAllFiles('public/stylesheets', (err, files) => {

    files = files.filter( x=> x.endsWith('.css'))
    files = files.filter( x=> path.basename(x) != '.css')

    let file = '';

    files.forEach((currentFile, index) => {

      if (index == 0) {
        file += '/*' + currentFile + '*/\n\n'  
      }
      else {
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
