/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var loaded = require('dotenv-extended').load('./.env');


var LUIS_URL = "";
var NODE_ENV = "development";

if (loaded) {
    LUIS_URL = process.env.LUIS_MODEL_URL;
    NODE_ENV = process.env.NODE_ENV;
} else {
    LUIS_URL = process.env['LUIS_MODEL_URL'];
    NODE_ENV = process.env['BotEnv'];
}

console.log("Running under env :" + NODE_ENV);
console.log("Using LUIS URL: " + LUIS_URL);

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var Store = require('./store');
var Hotel = require('./hotel-service');
var Domain = require('./domain');
var spellService = require('./spell-service');
var useEmulator = (NODE_ENV == 'development');


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

var recognizer = new builder.LuisRecognizer(LUIS_URL);
bot.recognizer(recognizer);


bot.dialog('/', [
    function (session, args) {
        session.send('Welcome to cozitrip! You can say like this: book 2 rooms from 2017-10-20 to 2017-10-22 in Sydney.');
    }
]);

bot.dialog('AskPrice',[
    function (session, args, next){
        
        var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'city');
        var fromDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::fromDate');
        var toDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::toDate');
        var roomNum = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.number');
        var hotelEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'hotelName');
        var indBreakfast = builder.EntityRecognizer.findEntity(args.intent.entities, 'breakfastInd');
        
        if (indBreakfast) {
            session.dialogData.indBreakfast = indBreakfast;
        }
        
        //session.send('We are analyzing your msg: \'%s\'', session.message.text);
       
        if (cityEntity) {
            session.dialogData.searchType = 'city';
            console.log("resolution.values:" + cityEntity.resolution.values[0]);
            
            session.dialogData.cityName = cityEntity.entity;
            session.dialogData.cityCode = cityEntity.resolution.values[0];
        } else {
            console.log("input city is null");
            //builder.Prompts.text("Please tell me where you want go?");
            session.beginDialog('askForCity').then (function(result){
                console.log('city response:' + result);
            });
            console.log("result of askForCity:" + session.userData.cityName);
            session.dialogData.cityName = session.userData.cityName;
            console.log("session.dialogData.cityName = " + session.dialogData.cityName );
        }
        
        if (hotelEntity) {
            session.dialogData.hotelEntity = hotelEntity;
            console.log('hotelUuid[0]:' + hotelEntity.resolution.values[0]);
        }
        if (fromDate) {
            session.dialogData.fromDate = fromDate.entity;
        } else {
            builder.Prompts.time("Please tell me your check-in date");
        }
        if (toDate) {
            session.dialogData.toDate = toDate.entity;
        } else {
            builder.Prompts.time("Please tell me your check-out date");
        }
        if (roomNum) {
            session.dialogData.RoomNum = roomNum.entity;
        } else {
            builder.Prompts.number("How many rooms do you want to book?");
        }
        console.log('jump to next session');
        next({ response: session.dialogData.cityName });
    },

    function (session, results) {
            console.log('start to search hotels.....');
            var message = 'Looking for hotel in ' + session.dialogData.cityName + ', please wait a while.';
            var hotelUuid = '';
            var hotelName = '';
            if (session.dialogData.hotelEntity) {
                hotelName = session.dialogData.hotelEntity.entity;
                message += '<br> Hotel Name: ' + hotelName;
                //TODO: check matched hotels
                hotelUuid = session.dialogData.hotelEntity.resolution.values[0];
            }
            message += '<br> Room number:' + session.dialogData.RoomNum;
            message += '<br> checkin at ' + session.dialogData.fromDate;
            message += '<br> checkout at ' + session.dialogData.toDate;
            var destination = session.dialogData.cityName;
            var checkin = session.dialogData.fromDate;
            var checkout = session.dialogData.toDate;
            
            session.send(message, destination);
        
        //******** get hotel information **********
//        Hotel.getHotelInfo('0a5612bb-d8a5-4577-9de2-c1ee80a4922a').then( function(hotelInfo) {
//           session.send(JSON.stringify(hotelInfo)); 
//        });
        var freeBreakfast = null;
        if (session.dialogData.indBreakfast) {
            if (session.dialogData.indBreakfast.resolution.values[0] == 'exBreakfast') {
                freeBreakfast = false;
            } else if (session.dialogData.indBreakfast.resolution.values[0] == 'inBreakfast') {
                freeBreakfast = true;
            }
        }
        var multiRequest = new Domain.multiRoomRequest(session.dialogData.cityCode, checkin, checkout, session.dialogData.RoomNum,freeBreakfast);
        
        Hotel.getRoomTypes(hotelUuid, multiRequest).then( function (rooms) {
            console.log('We find rooms: ' + JSON.stringify(rooms));
            console.log('total rooms size = ' + rooms.length);
            var message = 'we found following price for you for hotel ' + hotelName + ':';
            
            for (var i=0; i < rooms.length; i++) {
                console.log('processing ' + i + ': ' + rooms[i].roomName);
                message += '<br>' + rooms[i].roomName + ': ' + rooms[i].price + ', 是否免费取消：' + rooms[i].freeCancellation;
            }
            session.send(message);
            
//            var message = new builder.Message()
//                    .attachmentLayout(builder.AttachmentLayout.carousel)
//                    .attachments(rooms.map(roomAsAttachment));
//                session.send(message);
        });
        
        
//        Store.searchHotel(destination, checkin, checkout)
//            .then(function (hotels) {
//                var message = new builder.Message()
//                    .attachmentLayout(builder.AttachmentLayout.carousel)
//                    .attachments(hotels.map(hotelAsAttachment));
//                session.send(message);
//            });
         //End
        session.endDialog();

    }
]).triggerAction({
    matches: 'AskPrice'
});


// Dialog to ask for city
bot.dialog('askForCity', [
    function (session) {
        console.log("Starting in askForCity");
        builder.Prompts.text(session, "Please tell me where you want go?");
    },
    function (session, results) {
        session.send("ok, you want to go " + results.response);
        //session.dialogData.cityName = results.response;
        session.userData.cityName = results.response;
        session.endDialogWithResult(results);
       // next();
    }
]);

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
        //.images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://b2bweb-uat.cozitrip.com/#/home')
        ]);
}

function roomAsAttachment(room) {
    return '<br>' + room.roomName + ': ' + room.price;
//    return new builder.HeroCard()
//        .title(room.roomName)
//        .subtitle('From $%d.', room.price)
//        .images([new builder.CardImage().url(room.image)])
//        .buttons([
//            new builder.CardAction()
//                .title('Book')
//                .type('openUrl')
//                .value('https://b2bweb-uat.cozitrip.com/#/home')
//        ]);
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
