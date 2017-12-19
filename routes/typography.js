var express = require('express');
var router = express.Router();
var base = require('./base');

const { getRoute } = base;

const ids = [
  "h1",
  "h2",
  "meta",
  "h3",
  "h4",
  "h5",
  "p"
].join(',')

/* GET home page. */
router.get('/',
  getRoute('typography', ids)
);

module.exports = router;