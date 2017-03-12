//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan'),
    https    = require('https');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

function toTitleCase(str){
  str = str.replace(/-/g,' ');
  str = str.replace("bbc","BBC");
  str = str.replace("cnn","CNN");
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

app.get('/', function (req, res) {

  // news source options from News Api
  var chosenSources = ["bbc-news",
                  "bloomberg",
                  "buzzfeed",
                  "cnn",
                  "national-geographic",
                  "new-york-magazine",
                  "the-economist",
                  "the-huffington-post",
                  "the-new-york-times",
                  "the-wall-street-journal",
                  "the-washington-post",
                  "time"];

  var apiKey = "066301c377dd44cfbe7558f92871ff1e"
  var sortBy = "top"
  var source = chosenSources[Math.floor(Math.random() * chosenSources.length + 1)]
  var url = 'https://newsapi.org/v1/articles' + "?apiKey=" + apiKey + "&source=" + source + "&sortBy=" + sortBy

  var req = https.get(url, (result) => {
    const statusCode = result.statusCode;
    const contentType = result.headers['content-type'];

    result.setEncoding('utf8');
    var rawData = '';
    result.on('data', (chunk) => rawData += chunk);
    result.on('end', () => {
      try {
        var response = JSON.parse(rawData);

        // choose random article from list
        articlesList = response["articles"];
        article = articlesList[Math.floor(Math.random() * articlesList.length)]
        title = article["title"]
        description = article["description"]

        // choose three random sources in addition to correct source
        var sourceOptions = [];
        sourceOptions[0] = source;
        while(sourceOptions.length < 4){
            var randomSource = chosenSources[Math.floor(Math.random()*chosenSources.length)];
            if(sourceOptions.indexOf(randomSource) > -1) continue;
            sourceOptions[sourceOptions.length] = randomSource;
        }

        var Source = toTitleCase(source);
        var Title = title;
        var Description = description;
        var SourceOptions = sourceOptions;
        for (i = 0; i < sourceOptions.length; i++) {
          SourceOptions[i] = toTitleCase(sourceOptions[i]);
        }

        var values = [Source, Title, Description, SourceOptions]
        res.render('index.html', {val: values});

      } catch (e) {
        console.log(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
