const
  config = require('config'),
  request = require('request');

// Get the config const

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Welcome",
                        subtitle: "You are new to our chatbot !",
                        item_url: "https://developers.facebook.com/docs/messenger-platform/guides/quick-start#-tapes",
                        image_url: "https://cdn-images-1.medium.com/max/800/0*MDKwDDWaGDCF8J9a.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://developers.facebook.com/docs/messenger-platform/guides/quick-start#-tapes",
                            title: "Open Web URL"
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function authenticate(req) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    return true;
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    return false;
  }
}

function sendQuickReply(recipientId, message,  quick_replies) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: message,
      quick_replies: quick_replies
    }
  };

  callSendAPI(messageData);
}

function sendCarouselReply(recipientId, carousel) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: carousel
        }
      }
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  console.log(PAGE_ACCESS_TOKEN);
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

module.exports = {
  authenticate: authenticate,
  receivedMessage: receivedMessage,
  sendTextMessage: sendTextMessage,
  sendQuickReply: sendQuickReply,
  sendCarouselReply: sendCarouselReply,
  sendGenericMessage: sendGenericMessage
}