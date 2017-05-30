/**
 * Created by manu on 5/30/17.
 */
var express = require('express');
var router = express.Router();

/* GET hello world page. */
router.get('/', function(req, res, next) {
    res.render('weather');
});

module.exports = router;