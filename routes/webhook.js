var express = require('express');
var router = express.Router();
var chatService = require('../server/chatService');
var userService = require('../server/userService');

/* GET hello world page. */
router.get('/', function (req, res, next) {
    if (req.query['hub.mode'] === 'subscribe' && chatService.authenticate(req)) {
        res.status(200).send(req.query['hub.challenge']);
    }
    else {
        res.sendStatus(403);
    }
});

router.post('/', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.message) {
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

function receivedMessage(event) {
    //if the user is known
    if(userService.isUserKnown(event.sender.id)) {
        //send back message
        chatService.sendTextMessage(event.sender.id,event.message.text);
    }
    //else send welcome and add to database
    else {
        //We add the user and the time it is added
        userService.addUser(event.sender.id, event.timestamp);
        //We send a welcome message
        chatService.sendGenericMessage(event.sender.id);
    }
}


module.exports = router;
