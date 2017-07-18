module.exports = {
    
   saveEntities: function (builder, args, session) {
        console.log('start to saving result to session....');
        var cityEntity = builder.EntityRecognizer.findEntity(args.entities, 'city');
        var fromDate = builder.EntityRecognizer.findEntity(args.entities, 'date::fromDate');
        var toDate = builder.EntityRecognizer.findEntity(args.entities, 'date::toDate');
        var roomNum = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
        var hotelEntity = builder.EntityRecognizer.findEntity(args.entities, 'hotelName');
        var indBreakfast = builder.EntityRecognizer.findEntity(args.entities, 'breakfastInd');
       
        session.dialogData.cityEntity = cityEntity;
        session.dialogData.fromDate = fromDate;
        session.dialogData.toDate = toDate;
        session.dialogData.hotelEntity = hotelEntity;
        session.dialogData.indBreakfast = indBreakfast;
        session.dialogData.roomNum = roomNum;
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