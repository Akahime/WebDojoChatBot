var express = require('express');
var router = express.Router();
var chatService = require('../server/chatService')
/* GET hello world page. */
router.get('/', function(req, res, next) {
    res.send(chatService.authenticate(req));
});


module.exports = router;
