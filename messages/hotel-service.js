var Cozi = require('./cozi-service.js');
var Domain = require('./domain.js');

var response = Cozi.Get('/b2bWeb/checkConnection', function(data) {
    console.log("XXXXXXX Got GET response: " + data);
});

var multiRoomRequest = Domain.MultiRoomRequest;
console.log(multiRoomRequest.arrival);

module.exports = {
    getRoomTypes : function (hotelUuid) {
        return new Promise (function (resolve){
                    var postResponse = Cozi.Post('/api/getRoomTypes/0a5612bb-d8a5-4577-9de2-c1ee80a4922a?cid=CZTSYDA001&token=32d79b60-f075-49e1-baea-a9145fcd8361', multiRoomRequest, function(data) {
            //console.log('XXXXXXX Got POST response: ' + data)
            var roomTypes = JSON.parse(data).payload;

            console.log('Got ' + roomTypes.length + 'Rooms!');
            var rooms = [];
            for (var i = 1; i <= roomTypes.length; i++) {
                console.log('processing room ' + i);
                console.log(roomTypes[i]);
                if (roomTypes[i]) {
                    rooms.push({
                            roomName: roomTypes[i].roomDescription,
                            price: roomTypes[i].rateInfos[0].chargeableRate.total,
                            checkin: multiRoomRequest.checkin,
                            checkout: multiRoomRequest.checkout,
                            image: 'http://cozi-uat-images.oss-cn-hongkong.aliyuncs.com/b2b/hotels/AU/SYD/MH2MS-6865.jpg'
                        });
                }

            }
            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(rooms); }, 1000);
        });

            //Domain.RoomType = roomTypes[0];
            //console.log('Room1 ->');
            //console.log(Domain.RoomType);
            //roomTypes = JSON.parse(data.payload);
        });

    }
}


    