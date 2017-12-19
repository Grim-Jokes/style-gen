var express = require('express');
var router = express.Router();
var base = require('./base');

const { getRoute } = base;

const ids = [
  'input',
  'select',
  'checkbox'
].join(',')

/* GET home page. */
router.get('/',
  getRoute('forms', ids, 'forms')
);

module.exports = router;