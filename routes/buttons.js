var express = require('express');
var router = express.Router();
var base = require('./base');

const { getRoute } = base;

const ids = ["1. default",
    "primary-outline",
    "success-outline",
    "2. danger-outline",
    "link-outline"
  ].join(',')

/* GET home page. */
router.get('/',
  getRoute('buttons', ids)
);

module.exports = router;