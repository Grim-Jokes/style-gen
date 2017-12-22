var fs = require('fs');
const path = require('path');

function getAllFiles(dir, done) {
  let result = [];

  fs.readdir(dir, function (err, list) {
    var pending = list.length;
    if (!pending) return done(null, result);

    list.forEach((file) => {
      file = path.resolve(dir, file);

      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          result.push(file);

          getAllFiles(file, (err, res) => {
            result = result.concat(res);

            if (!--pending) {
              done(null, result);
            }
          });
        } else {
          result.push(file);

          if (!--pending) done(null, result);
        }
      });
    });
  });
}

function getRoute(id, ids, template) {
  path.basename(__filename);
  return (req, res, next) => {
    const templates = fs.readdirSync('public/templates/' + id).filter(x => x.endsWith('.html'))
    const styles = fs.readdirSync('public/stylesheets/' + id).filter(x => x.endsWith('.css'));

    const allStyles = getAllFiles(path.resolve(__dirname, '../public/stylesheets'), (err, result) => {

      result = result
        .filter(x => x.endsWith('.css'))
        .map(
          x => x.replace(path.resolve(__dirname, '../public'), '')
        );

      res.render( template || 'content', {
        title: 'Express',
        templates,
        styles,
        allStyles: result,
        ids
      });
    });
  }
}

module.exports = { 
  getRoute,
  getAllFiles
}