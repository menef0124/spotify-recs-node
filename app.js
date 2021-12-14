const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const qs = require('querystring');

//Load middleware
const { engine } = require('express-handlebars');
const { Querystring } = require('request/lib/querystring');

//Requires User class
User = require('./models/user');

const PORT = 8080;



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
    console.log("Hello");
    res.render('home');
});

app.get('/login', (req, res) => {
    let state = genRandString(16);
    res.cookie(stateKey, state);

    let scope = "user-read-private user-read-email";
    res.redirect(`https://accounts.spotify.com/authorize?`);
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));