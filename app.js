const express = require('express');
const path = require('path');
const session = require('express-session');

//Load middleware
const hbs = require('express-handlebars');

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
    .set('view engine', 'handlebars')
    .engine('handlebars', hbs());

app.get('/', (req, res) =>{
    console.log("Hello");
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));