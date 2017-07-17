module.exports = {
    
   multiRoomRequest: function (cityCode, arrival, departure, rooms, freeBreakfast) {
        this.uuid = '';
        this.cityCode = cityCode;
        this.arrival = arrival.replace(/ /g,'');
        this.departure = departure.replace(/ /g,'');
        this.currency = 'AUD';
        this.locale = 'zh-CN';
        this.rooms = rooms;
        this.freeBreakfast = freeBreakfast;
        this.freeCancellation = null;
    }


};

