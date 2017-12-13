// ----------------------------
// Import Node Modules
// ----------------------------

const cors  = require('cors')
const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const querystring = require('querystring')
const multipart = require('connect-multiparty')
const https = require('https')

// ----------------------------
// Create express app
// ----------------------------

const app = express()

// ----------------------------
// Load the middlewares
// ----------------------------

app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));

// ----------------------------
// Multiparty middleware
// ----------------------------

const multipartMiddleware = multipart();

// ----------------------------
// Enter API Credentials
// ----------------------------

const at_username = 'XXXXX_USERNAME_XXXXX';
const at_key = 'XXXXXX_APIKEY_XXXXXX';

// ----------------------------
// Helper Functions
// ----------------------------
function getOtp(){
    let result = [];
    for(let i=0;i<6;i++){
        result.push( Math.floor( Math.random() * 9));
    }
    return result.join('');
}

// ----------------------------
// Create app routes
// ----------------------------

app.get('/', function(req, res){
    res.render('index');
});

app.post('/verify', multipartMiddleware, function(req, res){
    let receiver = req.body.number;
    let otp = getOtp();
    let message = 'Hi, your One-Time Password is ' + otp + '. Please enter this on our verifier app to move to the next step';
    let body = querystring.stringify({
        'username': at_username,
        'to' : receiver,
        'message' : message,
    });

    let options = {
        url   : 'https://api.sandbox.africastalking.com/version1/messaging',
        method : 'POST',
        rejectUnauthorized : false,
        requestCert        : true,
        agent              : false,
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': body.length,
            'Accept': 'application/json',
            'apikey': at_key
        },
        body : body
    };
        
    console.log('About to make call to Africastalking send endpoint');    
    request(options, function(error, response, body){
        if (!error) {
            var info = JSON.parse(body);
            console.log('Success');
            var recipients = info.SMSMessageData.Recipients;
            if( recipients.length > 0 ){
                return res.json({
                    'status' : true,
                    'code' : otp,
                });
            }else{
                return res.json({
                    'status' : false,
                }); 
            }
        }else{
            console.log('Sorry and error occured');
            console.log( error );
            return res.json({
                'status' : false,
            });
        }
    })
    
});

// ----------------------------
// Set Port
// ----------------------------

app.listen('3120');
console.log('Listening on localhost:3120');