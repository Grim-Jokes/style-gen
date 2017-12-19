var express = require('express');
var router = express.Router();
var base = require('./base');

const { getRoute } = base;

const ids = [
  "modal"
]

router.get('/',
  getRoute('modals', ids.join(','), "modal")
);

module.exports = router;