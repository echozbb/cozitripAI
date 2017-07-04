/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
require('dotenv-extended').load();

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var Store = require('./store');
var spellService = require('./spell-service');

var useEmulator = (process.env.NODE_ENV == 'development');
console.log("process.env.NODE_ENV="+process.env.NODE_ENV);

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

//var bot = new builder.UniversalBot(connector, [
//    function (session) {
//        session.send("Welcome to the cozitrip! What can I help you?");
//    }
//]);

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

console.log("Posting to LUIS server..." + process.env.LUIS_MODEL_URL);

bot.dialog('/', [
    function (session, args) {
        session.send('Welcome to cozitrip! You can say like this: book 2 rooms from 2017-10-20 to 2017-10-22 in Sydney.')
        session.send(process.env.LUIS_MODEL_URL);
    }
]);

bot.dialog('AskPrice',[
    function (session, args, next){
        
        var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'city');
        var fromDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::fromDate');
        var toDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::toDate');
        var roomNum = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.number');
        
        session.send('We are analyzing your msg: \'%s\'', session.message.text);
       
        if (cityEntity) {
            session.dialogData.searchType = 'city';
            session.dialogData.cityName = cityEntity.entity;
        } 
        if (fromDate) {
            session.dialogData.fromDate = fromDate.entity;
        }
        if (toDate) {
            session.dialogData.toDate = toDate.entity;
        }
        if (roomNum) {
            session.dialogData.RoomNum = roomNum.entity;
        }
        next({ response: cityEntity.entity });
    },
    function (session, results) {
            var message = 'Looking for hotels in ' + session.dialogData.cityName;
            message += '<br> Room number:' + session.dialogData.RoomNum;
            message += '<br> checkin at ' + session.dialogData.fromDate;
            message += '<br> checkout at ' + session.dialogData.toDate;
            var destination = session.dialogData.cityName;
            var checkin = session.dialogData.fromDate;
            var checkout = session.dialogData.toDate;
            
            session.send(message, destination);
        
        Store.searchHotel(destination, checkin, checkout)
            .then(function (hotels) {
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(hotels.map(hotelAsAttachment));
                session.send(message);
            });
         //End
        session.endDialog();

    }
]).triggerAction({
    matches: 'AskPrice'
});


bot.dialog('Help', function (session) {
    session.endDialog('Hi! Try asking me things like /2017-10-20 to 2017-10-22 in Sydney, 2 rooms/');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://b2bweb-uat.cozitrip.com/#/home')
        ]);
}

function reviewAsAttachment(review) {
    return new builder.ThumbnailCard()
        .title(review.title)
        .text(review.text)
        .images([new builder.CardImage().url(review.image)]);
}

//bot.dialog('/', [
//    function (session) {
//        builder.Prompts.text(session, "Hello... What's your name?");
//    },
//    function (session, results) {
//        session.userData.name = results.response;
//        builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
//    },
//    function (session, results) {
//        session.userData.coding = results.response;
//        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
//    },
//    function (session, results) {
//        session.userData.language = results.response.entity;
//        session.send("Got it... " + session.userData.name + 
//                    " you've been programming for " + session.userData.coding + 
//                    " years and use " + session.userData.language + ".");
//    }
//]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
