const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { SSL_OP_CRYPTOPRO_TLSEXT_BUG } = require('constants');


const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());


app.get('/', function(req, res) {
    res.send('Hello from server!');
    console.log("HELLO!")
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

app.get('/autoComplete', async(req, res) => {
    var currentTicker = req.query.term;
    console.log("***************************************** autoComplete *****************************************");
    console.log(currentTicker);
    var autoRes = null;
    const currentQueryAutoComplete = {
        'url': 'https://api.tiingo.com/tiingo/utilities/search?query=' + currentTicker + '&token=0d4d0b16d5d78a6e4e7a93f93aa219b215827d30',
        'headers': {
            'Content-Type': 'application/json'
        }
    }; //0d4d0b16d5d78a6e4e7a93f93aa219b215827d30 73645ccad48e1f73a1702ab7f8c322b980aabb8a
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

app.get('/details', async function(req, res) {
    console.log(req.query.ticker)
    var currentTicker = req.query.ticker
    var solutions = {}

    await axios.get('https://api.tiingo.com/tiingo/daily/' + currentTicker + '?token=0d4d0b16d5d78a6e4e7a93f93aa219b215827d30')
        .then(function(response) {
            // handle success
            solutions['companyDetails'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });

    await axios.get('https://api.tiingo.com/iex/?tickers=' + currentTicker + '&token=0d4d0b16d5d78a6e4e7a93f93aa219b215827d30')
        .then(function(response) {
            // handle success
            solutions['companyFullDetails'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });

    res.json({ solutions });

});

app.get('/details/intradayChartData', async function(req, res) {
    console.log("XYZ")
    var startDate = req.query.date;
    var currentTicker = req.query.ticker
    var intradayChartData = {}
    await axios.get('https://api.tiingo.com/iex/' + currentTicker + '/prices?startDate=' + startDate + '&resampleFreq=4min&columns=open,high,low,close,volume&token=0d4d0b16d5d78a6e4e7a93f93aa219b215827d30')
        .then(function(response) {
            // handle success
            intradayChartData['intradayChartData'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });
    res.send(intradayChartData);

})

app.get('/news', function(req, res) {
        var currentTicker = req.query.ticker
        axios.get('https://newsapi.org/v2/everything?q=' + currentTicker + '&apiKey=5563cb8a86b64754b8a0c8339c66aee1')
            .then(function(response) {
                // handle success
                res.send({ news: response.data })
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            })
            .then(function() {
                // always executed
            });
    }) //be1ee6aa98db4ba4b247203afee80c8b 5563cb8a86b64754b8a0c8339c66aee1

https: //newsapi.org/v2/everything?q=bitcoin&apiKey=be1ee6aa98db4ba4b247203afee80c8b


    app.listen(PORT, function() {
        console.log("Server: " + PORT)
    });