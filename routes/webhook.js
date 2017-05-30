var express = require('express');
var router = express.Router();
var chatService = require('../server/chatService')
/* GET hello world page. */
router.get('/', function(req, res, next) {
    if(chatService.authenticate(req)) {
        res.send("1495392341");
    }
    else{
        res.send("400");
    }
});


module.exports = router;
