const LUISClient = require("./luis_sdk");

var LUISclient = null;
if (process.env.APPID) {
    var LUISclient = LUISClient({
      appId: process.env.APPID,
      appKey: process.env.APPKEY,
      verbose: true
    });
} else {
    var LUISclient = LUISClient({
      appId: process.env['APPID'],
      appKey: process.env['APPKEY'],
      verbose: true
    });
}


module.exports = {
    
   saveEntities: function (builder, args, session) {
       console.log('start to saving result to session....');
//       if (args.intent) {
//            var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'city');
//            var fromDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::fromDate');
//            var toDate = builder.EntityRecognizer.findEntity(args.intent.entities, 'date::toDate');
//            var roomNum = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.number');
//            var hotelEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'hotelName');
//            var indBreakfast = builder.EntityRecognizer.findEntity(args.intent.entities, 'breakfastInd');
//       
//       } else {
           var cityEntity = builder.EntityRecognizer.findEntity(args.entities, 'city');
            var fromDate = builder.EntityRecognizer.findEntity(args.entities, 'date::fromDate');
            var toDate = builder.EntityRecognizer.findEntity(args.entities, 'date::toDate');
            var roomNum = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
            var hotelEntity = builder.EntityRecognizer.findEntity(args.entities, 'hotelName');
            var indBreakfast = builder.EntityRecognizer.findEntity(args.entities, 'breakfastInd');
     //  }
       
        session.dialogData.cityEntity = cityEntity;
        session.dialogData.fromDate = fromDate;
        session.dialogData.toDate = toDate;
        session.dialogData.hotelEntity = hotelEntity;
        session.dialogData.indBreakfast = indBreakfast;
        session.dialogData.roomNum = roomNum;
    },
    
    extractLuis: function (query) {
        return new Promise (function (resolve){
            var response = LUISclient.predict(query, {
                 onSuccess: function (response) {
                     console.log('LUIS RESPONSE: ' + JSON.stringify(response));
                     setTimeout(function () { resolve(response); }, 1000);
                 },
                 onFailure: function (err) {console.error(err);}
            });
            
        })    
    },
    
    removeDuplicates: function (arr, key) {
    if (!(arr instanceof Array) || key && typeof key !== 'string') {
        return false;
    }

    if (key && typeof key === 'string') {
        return arr.filter((obj, index, arr) => {
            return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index;
        });

    } else {
        return arr.filter(function(item, index, arr) {
            return arr.indexOf(item) == index;
        });
    }
}


};