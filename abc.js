var express = require('express')
const request = require('request');
const bodyParser = require('body-parser');
const { SSL_OP_CRYPTOPRO_TLSEXT_BUG } = require('constants');


const PORT = process.env.PORT || 3000;

var app = express()


app.use(bodyParser.json());

app.get('/', function(req, res) {

    res.send('Hello from server!');
    console.log("HELLO!")
})

app.get('/autoComplete', async(req, res) => {
    var currentTicker = req.query.term;
    console.log("***************************************** autoComplete *****************************************");

    console.log(currentTicker);
    var autoRes = null;
    const currentQueryAutoComplete = {
        'url': 'https://api.tiingo.com/tiingo/utilities/search?query=' + currentTicker + '&token=73645ccad48e1f73a1702ab7f8c322b980aabb8a',
        'headers': {
            'Content-Type': 'application/json'
        }
    };
    request(currentQueryAutoComplete, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Before Json Parse: " + body);
            autoRes = JSON.parse(body);
            var count = Object.keys(autoRes).length;
            console.log("Count: " + count);
            res.json(autoRes);
        } else {
            console.log("Error: " + error + "Status code" + response.statusCode);
        }
    });

});


app.listen(3000)