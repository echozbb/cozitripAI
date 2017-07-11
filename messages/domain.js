module.exports = {
     MultiRoomRequest :{
        uuid: '',
        cityCode: "SYD",
        userUuid: "",
        arrival: "2017-10-20",
        departure: "2017-10-22",
        currency: "AUD",
        locale: "zh-CN",
        rooms: 1,
        freeBreakfast: false
    },

    RoomType: {
        roomTypeCode: '',
        rateCode: '',
	    roomDescription: '',
	    untranslatedRoomDescription: '',
	    roomDescriptionLong: '',
	    smokingPreferences: '',
	    rateInfos: [],
	    hotelImages : [],
        bedTypes: [],
        rateOccupancyPerRoom: 2,
        quotedOccupancy: 2,
        childOccupancy: 0,
        roomDetailUuid: ''
    },
    
    RateInfo : {
        freeCancellation: false,
        onRequest: false,
        deadLine: '',
        providerDeadLine: '',
        taxRate: 0,
        chargeableRate: '',
        cancellationDesc: '',
        originalCancellationDesc: '',
        rateType: '',
        description: [],
        rooms: [],
        cancelPolicyInfos: [],
        roomBookingInfo: '',
        mealsPlan: '',
        minStays: 1,
        optionalMealsPlan: []   
    },

    MealsPlan : {
        breakfast: false,
        description: ''
    }
};

