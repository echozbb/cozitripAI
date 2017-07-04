var Promise = require('bluebird');

var ReviewsOptions = [
    '“Very stylish, great stay, great staff”',
    '“good hotel awful meals”',
    '“Need more attention to little things”',
    '“Lovely small hotel ideally situated to explore the area.”',
    '“Positive surprise”',
    '“Beautiful suite and resort”'];

module.exports = {
//    searchHotels: function (destination) {
//        return new Promise(function (resolve) {
//
//            // Filling the hotels results manually just for demo purposes
//            var hotels = [];
//            for (var i = 1; i <= 5; i++) {
//                hotels.push({
//                    name: destination + ' Hotel ' + i,
//                    location: destination,
//                    rating: Math.ceil(Math.random() * 5),
//                    numberOfReviews: Math.floor(Math.random() * 5000) + 1,
//                    priceStarting: Math.floor(Math.random() * 450) + 80,
//                    image: 'http://cozi-uat-images.oss-cn-hongkong.aliyuncs.com/b2b/hotels/AU/SYD/MH2MS-6865.jpg'
//                });
//            }
//
//            hotels.sort(function (a, b) { return a.priceStarting - b.priceStarting; });
//
//            // complete promise with a timer to simulate async response
//            setTimeout(function () { resolve(hotels); }, 1000);
//        });
//    },
    
    searchHotel: function (destination, checkin, checkout){
        return new Promise(function (resolve) {
             // Filling the hotels results manually just for demo purposes
            var hotels = [];
            for (var i = 1; i <= 5; i++) {
                hotels.push({
                    name: destination + ' Hotel ' + i,
                    location: destination,
                    rating: Math.ceil(Math.random() * 5),
                    numberOfReviews: Math.floor(Math.random() * 5000) + 1,
                    priceStarting: Math.floor(Math.random() * 450) + 80,
                    checkin: checkin,
                    checkout: checkout,
                    image: 'http://cozi-uat-images.oss-cn-hongkong.aliyuncs.com/b2b/hotels/AU/SYD/MH2MS-6865.jpg'
                });
            }

            hotels.sort(function (a, b) { return a.priceStarting - b.priceStarting; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(hotels); }, 1000);

//            
//            var msg = new builder.Message(session);
//            msg.attachmentLayout(builder.AttachmentLayout.carousel)
//            msg.attachments([
//                new builder.HeroCard(session)
//                    .title(desitination+ ' 1st hotel')
//                    .subtitle("5 stars hotel")
//                    .text("checkin=" + checkin + ", checkout=" + checkout)
//                    .images([builder.CardImage.create(session, 'http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/AHS1PH-5377.jpg')])
//                    .buttons([
//                        builder.CardAction.imBack(session, "Book Hotel", "Book")
//                    ]),
//                new builder.HeroCard(session)
//                    .title(desitination+ ' 2nd hotel')
//                    .subtitle("4.5 stars hotel")
//                    .text("checkin=" + checkin + ", checkout=" + checkout)
//                    .images([builder.CardImage.create(session, 'http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/AHS1PH-5378.jpg')])
//                    .buttons([
//                        builder.CardAction.imBack(session, "Book Hotel", "Book")
//                    ]),
//                new builder.HeroCard(session)
//                    .title(desitination+ ' 3rd hotel')
//                    .subtitle("4 starts hotel")
//                    .text("checkin=" + checkin + ", checkout=" + checkout)
//                    .images([builder.CardImage.create(session, 'http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/AHS1PH-5379.jpg')])
//                    .buttons([
//                        builder.CardAction.imBack(session, "Book Hotel", "Book")
//                    ])
//            ]);
        });
       
    },

    searchHotelReviews: function (hotelName) {
        return new Promise(function (resolve) {

            // Filling the review results manually just for demo purposes
            var reviews = [];
            for (var i = 0; i < 5; i++) {
                reviews.push({
                    title: ReviewsOptions[Math.floor(Math.random() * ReviewsOptions.length)],
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris odio magna, sodales vel ligula sit amet, vulputate vehicula velit. Nulla quis consectetur neque, sed commodo metus.',
                    image: 'http://cozi-uat-images.oss-cn-hongkong.aliyuncs.com/b2b/hotels/AU/SYD/MH2MS-6865.jpg'
                });
            }

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(reviews); }, 1000);
        });
    }
};