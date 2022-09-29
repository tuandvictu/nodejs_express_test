var express = require('express'),
  bodyParser = require('body-parser'); 
const { listTranslations } = require('./controller/sentences');

function initHttpServer() {
  // Create global app object
  var app = express();

  // Normal express config defaults
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/translattions", listTranslations)

  // finally, let's start our server...
  var server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
  });

}

module.exports = initHttpServer;
