
const request = require('request');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors);

app.get('/autoComplete', async(req,res) => {
    var currentTicker = req.query.term;
    var res = null;
    const currentQueryAutoComplete = {
        'url': 'https://api.tiingo.com/tiingo/utilities/search?query='+currentTicker+'&token=73645ccad48e1f73a1702ab7f8c322b980aabb8a',
        'headers': {
            'Content-Type': 'application/json'
            }
    };
    request(currentQueryAutoComplete,function(error, response, body) {
        if(!error && response.statusCode === 200)
        {
            console.log("Before Json Parse: "+ body);
            res = JSON.parse(body);
            var count = Object.keys(res).length;
            console.log("Count: "+count);
            response.json(res);
        }
        else {
            console.log("Error: " + error+ "Status code"+ response.statusCode);
        }
        }
    );        

});

app.get('/details', function(req,res){
    
    const companyDescription = {
        'url': 'https://api.tiingo.com/tiingo/daily/aapl?token=73645ccad48e1f73a1702ab7f8c322b980aabb8a',
        'headers': {
            'Content-Type': 'application/json'
            }
        };

request(companyDescription,
        function(error, response, body) {
            console.log(body);
        }
);        

});