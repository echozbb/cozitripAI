var Cozi = require('./cozi-service');
var functions = require('./functions');
//var Domain = require('./domain');

var response = Cozi.Get('/b2bWeb/checkConnection', function(data) {
    console.log("XXXXXXX Got GET response: " + data);
});

//var multiRoomRequest = Domain.MultiRoomRequest;
//console.log(multiRoomRequest.arrival);

module.exports = {
    checkConnection: function (){
        console.log('check connection method add here.');
    },
    
    getHotelInfo : function (hotelUuid) {
      return new Promise (function (resolve) {
          var getResponse = Cozi.Get('/api/getHotelInfo/' + hotelUuid, function(data) {
              var hotelInfo = JSON.parse(data).payload;
              console.log('get hotelInfo -> ' + JSON.stringify(hotelInfo));
              
              setTimeout(function () { resolve(hotelInfo); }, 1000);
          });
      });  
    },
    
    getRoomTypes : function (hotelUuid, multiRoomRequest) {
        return new Promise (function (resolve){
                    var postResponse = Cozi.Post('/api/getRoomTypes/'+hotelUuid, multiRoomRequest, function(data) {
            //console.log('XXXXXXX Got POST response: ' + data)
            var roomTypes = JSON.parse(data).payload;

            console.log('Got ' + roomTypes.length + 'Rooms!');
            var rooms = [];
            for (var i = 1; i <= roomTypes.length; i++) {
                console.log('processing room ' + i);
                //console.log(roomTypes[i]);
                if (roomTypes[i]) {
                    rooms.push({
                            roomName: roomTypes[i].roomDescription,
                            price: Math.round(roomTypes[i].rateInfos[0].chargeableRate.total),
                            checkin: multiRoomRequest.checkin,
                            checkout: multiRoomRequest.checkout,
                            breakfast: roomTypes[i].rateInfos[0].mealsPlan.description,
                            freeCancellation: roomTypes[i].rateInfos[0].freeCancellation
                            //image: 'http://cozi-uat-images.oss-cn-hongkong.aliyuncs.com/b2b/hotels/AU/SYD/MH2MS-6865.jpg'
                        });
                }

            }
            rooms = functions.removeDuplicates(rooms, 'roomName');
            rooms.sort(function (a, b) { return a.price - b.price; });
                 
            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(rooms); }, 1000);
        });
        });

    },
    
}


    