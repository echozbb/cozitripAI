//var request = require('request');
//
//request.get('https://cicadaweb-uat.cozitrip.com/b2bWeb/checkConnection')
//    .on('response', function(response) {
//    console.log(response.statusCode) // 200 
//    console.log(response.headers['content-type']) // 'image/png' 
//    console.log(response);
//  }).pip(response)

//request('http://www.google.com', function (error, response, body) {
//  console.log('error:', error); // Print the error if one occurred 
//  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
//  console.log('body:', body); // Print the HTML for the Google homepage. 
//});


var https = require('https');

var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json'
};

function option(path, method){
    this.host = 'cicadaweb-uat.cozitrip.com';
    this.port = '443';
    this.path = path;
    this.method = method;
    this.headers = headers;
}

module.exports = {
    Get: function (path, cb) {
        path = path + '?cid=' + process.env.COZI_APP_ID + '&token=' + process.env.COZI_APP_TOKEN
        //var options = default_option;
        var options = new option(path, 'GET');
        //options.path = path;
        return https.request(options, function(res) {
          console.log('Calling GET cozitrip service ...' + options.path);
          console.log('STATUS: ' + res.statusCode);
          //console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          var data = '';
          res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
              data += chunk;
              //cb(chunk);
          });
        
          res.on('end', function(){
              cb(data);
          });
          res.on('error', function (e){
             console.log(e); 
          });
        }).end();
    },
   
    Post: function (path, resquestBody, cb) {
        path = path + '?cid=' + process.env.COZI_APP_ID + '&token=' + process.env.COZI_APP_TOKEN
        var options = new option(path, 'POST');
        jsonObject = JSON.stringify(resquestBody);
        var reqPost = https.request(options, function(res){
            console.log('Calling POST cozitrip service ...' + options.path);
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var data='';
            res.on('data', function (chunk) {
                data += chunk;
            });
            
            res.on('end',function(){
                cb(data);
            });

        });
        console.log('RequestBody: ' + jsonObject);
        reqPost.write(jsonObject);
        reqPost.end();
        reqPost.on('error', function(e){
            console.log(e);
        });                
    }
}




//var req = http.request(options, function(res) {
//  var msg = '';
//
//  res.setEncoding('utf8');
//  res.on('data', function(chunk) {
//    msg += chunk;
//  });
//  res.on('end', function() {
//    console.log(JSON.parse(msg));
//  });
//});
//
//req.write(data);
//req.end();