//Load libraries
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyWebApi = require('spotify-web-api-node');
const qs = require('querystring');
const request = require('request');

//Load middleware
const { engine } = require('express-handlebars');

//Requires User class
User = require('./models/user');

//Node server port
const PORT = 8080;

//Used for generating state value
let genRandString = function (len){
    let txt = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i=0;i<len;i++){
        txt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txt;
};

//Variables for later
var scopes = ['user-read-private', 'user-read-email'];
var stateKey = 'spotify_auth_state';
let app = express();

//Express server setup
app.use(express.static(path.join(__dirname, 'static')))
    .use(express.urlencoded({extended: false}))
    .use(session({secret: 'superSecret', resave: false, saveUninitialized: false}))
    .use(cors())
    .use(cookieParser())
    .engine('handlebars', engine())
    .set('view engine', 'handlebars')
    .set('views', './views');

//Home page route
app.get('/', (req, res) => {
    console.log("Route works!");
    res.render('home');
});

//Instantiate API object using credentials and Redirect URI (Use your own client ID, secret, and redirect URI from your Spotify Developer Dashboard)
var spotify = new spotifyWebApi({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
});

//Login button route, generates state and authorization URL
app.get('/login', (req, res) =>{
    let state = genRandString(16);
    res.cookie(stateKey, state);

    var authURL = spotify.createAuthorizeURL(scopes, state);
    console.log(authURL);

    res.redirect(authURL);
});

//Callback route for authURL to redirect to
app.get('/callback', (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;
    let access_token = "";
    let refresh_token = "";

    //Ensures the same user is trying to go through authorization
    if(state === null || state !== storedState){
        console.log("Invalid state");
        res.redirect('/');
    }
    else{
        //Do tha authorization
        console.log("auth running");
        spotify.authorizationCodeGrant(code).then(
            function(data){
                access_token = data.body['access_token'];
                refresh_token = data.body['refresh_token'];
                console.log(data.body);

                //Token setters
                spotify.setAccessToken(access_token);
                spotify.setRefreshToken(refresh_token);

                //Get current user's info and pass it and their tokens back to the home page
                console.log("getMe running");
                spotify.getMe().then(
                    function(data){
                        console.log("getMe worked");
                        console.log(data.body);
                        let user_info = data.body;
                        res.render('home', {user_info: user_info, access_token: access_token, refresh_token: refresh_token});
                    },
                    function(err){
                        console.log("getMe didn't work");
                        console.log("Couldn't get your info, here's probably why: ", err);
                    }
                );
            },
            function(err){
                console.log('Auth messed up idk why', err);
            }
        );
    }
});

/*
//Used for generating state value
let genRandString = function (len){
    let txt = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i=0;i<len;i++){
        txt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txt;
};

let stateKey = 'spotify_auth_state';

let app = express();

//Express server setup
app.use(express.static(path.join(__dirname, 'static')))
    .use(express.urlencoded({extended: false}))
    .use(session({secret: 'superSecret', resave: false, saveUninitialized: false}))
    .use(cors())
    .use(cookieParser())
    .engine('handlebars', engine())
    .set('view engine', 'handlebars')
    .set('views', './views');

//Home page route
app.get('/', (req, res) => {
    console.log("Route works!");
    res.render('home');
});

//Redirects user to Spotify authentication page
app.get('/login', (req, res) => {
    let state = genRandString(16);
    res.cookie(stateKey, state);

    let scope = "user-read-private user-read-email";
    res.redirect('https://accounts.spotify.com/authorize?' + 
        qs.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

//Receives authorization code
app.get('/callback', (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state === null || state !== storedState){
        res.redirect('/#' +
            qs.stringify({
                error: 'state_mismatch'
            }));
    }
    else{
        res.clearCookie(stateKey);
        console.log(req.query);
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code"
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if(!error && response.statusCode === 200){
                let access_token = body.access_token;
                let refresh_token = body.refresh_token;
                let user_info;
                console.log("Setting options");
                let options = {
                    url: "https://api.spotify.com/v1/me",
                    headers: {'Authorization': 'Bearer ' + access_token},
                    json: true
                };

                request.get(options, (error, response, body) =>{
                    console.log("Getting user info");
                    //user_info = body;
                });
                console.log("Should have user info");
                res.render('home', {access_token: access_token,
                                    refresh_token: refresh_token,
                                    user_info: user_info}
                );
            }
            else{
                console.log("There were errors, idk why");
                res.redirect('/#' +
                    qs.stringify({
                        error: 'invalid token'
                }));
            }
        });
    }
});
*/
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));