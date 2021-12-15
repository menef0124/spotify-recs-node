const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const qs = require('querystring');

//Load middleware
const { engine } = require('express-handlebars');
const { Querystring } = require('request/lib/querystring');
const { redirect } = require('express/lib/response');
const { request } = require('http');
const { access } = require('fs');

//Requires User class
User = require('./models/user');

const PORT = 8080;

var client_id = 'd4484a4fdf5d46399a175194a99c473a'; // Your client id
var client_secret = '3e64f96b117e4f49b696a8cf2965f478'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

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

app.get('/', (req, res) => {
    console.log("Route works!");
    res.render('home');
});

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

app.get('/callback', (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state === null || state !== storedState0){
        res.redirect('/#' +
            qs.stringify({
                error: 'state_mismatch'
            }));
    }
    else{
        res.clearCookie(stateKey);
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code"
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base65'))
            },
            json: true
        };

        request.post(authOptions, (error, res, body) => {
            if(!error && res.statusCode === 200){
                let access_token = body.access_token;
                let refresh_token = body.refresh_token;

                let options = {
                    url: "https://api.spotify.com/v1/me",
                    headers: {'Authorization': 'Bearer ' + access_token},
                    json: true
                };

                request.get(options, (error, res, body) =>{
                    console.log(body);
                });

                res.redirect('/#' +
                    qs.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
                
            }
            else{
                res.redirect('/#' +
                    qs.stringify({
                        error: 'invalid token'
                }));
            }
        });
    }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));