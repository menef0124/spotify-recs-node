//Load libraries
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyWebApi = require('spotify-web-api-node');

//Load middleware
const { engine } = require('express-handlebars');

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
var scopes = ['user-read-private', 'user-read-email', 'user-top-read'];
var stateKey = 'spotify_auth_state';
var user_info;
var access_token;
var refresh_token;
var topTracks;

//Instantiate Express object
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

//Instantiate API object using credentials and Redirect URI (Use your own client ID, secret, and redirect URI from your Spotify Developer Dashboard)
var spotify = new spotifyWebApi({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
});

//Home page route
app.get('/', (req, res) => {
    if(user_info){
        /*
        spotify.getUserPlaylists(user_info['id']).then(
            function(data){
                console.log(user_info['id'] + "'s playlists: ", data.body);
            },
            function(err){
                console.log('Something went wrong: ', err);
            }
        );
        */
        spotify.getMyTopTracks({time_range: "long_term", limit: 50}).then(
            function(data){
                topTracks = data.body.items;
                res.render('seeds', {user_info: user_info});
            },
            function(err){
                console.log("Something went wrong!", err);
            }
        );
    }
    else{
        res.render('home');
    }
});

//Login button route, generates state and authorization URL
app.get('/login', (req, res) =>{
    let state = genRandString(16);
    res.cookie(stateKey, state);

    var authURL = spotify.createAuthorizeURL(scopes, state, true);
    console.log(authURL);

    res.redirect(authURL);
});

//Logout button route, signs user out from Spotify then reloads the home page
app.get('/logout', (req, res) =>{
    user_info = null;
    res.redirect('/');
});

//Callback route for authURL to redirect to
app.get('/callback', (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    //Ensures the same user is trying to go through authorization
    if(state === null || state !== storedState){
        console.log("Invalid state");
        res.redirect('/');
    }
    else{
        res.clearCookie(stateKey);

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
                        user_info = data.body;
                        res.redirect('/');
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

app.get('/getRecs', (req, res) =>{
    let market = user_info.country;
    let topFive = topTracks.slice(0,5);
    const trackSeeds = [];

    for(let i=0;i<topFive.length;i++){
        trackSeeds.push(topFive[i].id);
    }
    let acousticness = 0;
    let max_acousticness;
    let min_acousticness;
    let danceability = 0;
    let max_danceability;
    let min_danceability;
    let energy = 0;
    let max_energy;
    let min_energy;
    let instrumentalness = 0;
    let max_instrumentalness;
    let min_instrumentalness;
    let key = 0;
    let max_key;
    let min_key;
    let liveness = 0;
    let max_liveness;
    let min_liveness;
    let loudness = 0;
    let max_loudness;
    let min_loudness;
    let speechiness = 0;
    let max_speechiness;
    let min_speechiness;
    let tempo = 0;
    let max_tempo;
    let min_tempo;
    let valence = 0;
    let max_valence;
    let min_valence;
    for(let i=0;i<topTracks.length;i++){
        let features;
        spotify.getAudioFeaturesForTrack(topTracks[i].id).then(
            function(data){
                features = data.body;
                if(i == 0){
                    acousticness = features.acousticness;
                    max_acousticness = features.acousticness;
                    min_acousticness = features.acousticness;
                    danceability = features.danceability;
                    max_danceability = features.danceability;
                    min_danceability = features.danceability;
                    energy = features.energy;
                    max_energy = features.energy;
                    min_energy = features.energy;
                    instrumentalness = features.instrumentalness;
                    max_instrumentalness = features.instrumentalness;
                    min_instrumentalness = features.instrumentalness;
                    key = features.key;
                    max_key = features.key;
                    min_key = features.key;
                    liveness = features.liveness;
                    max_liveness = features.liveness;
                    min_liveness = features.liveness;
                    loudness = features.loudness;
                    max_loudness = features.loudness;
                    min_loudness = features.loudness;
                    speechiness = features.speechiness;
                    max_speechiness = features.speechiness;
                    min_speechiness = features.speechiness;
                    tempo = features.tempo;
                    max_tempo = features.tempo;
                    min_tempo = features.tempo;
                    valence = features.valence;
                    max_valence = features.valence;
                    min_valence = features.valence;
                }
                else{
                    acousticness += features.acousticness;
                    danceability += features.danceability;
                    energy += features.energy;
                    instrumentalness += features.instrumentalness;
                    key += features.key;
                    liveness += features.liveness;
                    loudness += features.loudness;
                    speechiness += features.speechiness;
                    tempo += features.tempo;
                    valence += features.valence;
        
                    if(features.acousticness <= min_acousticness)
                        min_acousticness = features.acousticness;
                    if(features.acousticness >= max_acousticness)
                        max_acousticness = features.acousticness;
                    if(features.danceability <= min_danceability)
                        min_danceability = features.danceability;
                    if(features.danceability >= max_danceability)
                        max_danceability = features.danceability;
                    if(features.energy <= min_energy)
                        min_energy = features.energy;
                    if(features.energy >= max_energy)
                        max_energy = features.energy;
                    if(features.instrumentalness <= min_instrumentalness)
                        min_instrumentalness = features.instrumentalness;
                    if(features.instrumentalness >= max_instrumentalness)
                        max_instrumentalness = features.instrumentalness;
                    if(features.key <= min_key)
                        min_key = features.key;
                    if(features.key >= max_key)
                        max_key = features.key;
                    if(features.liveness <= min_liveness)
                        min_liveness = features.liveness;
                    if(features.liveness >= max_liveness)
                        max_liveness = features.liveness;
                    if(features.loudness <= min_loudness)
                        min_loudness = features.loudness;
                    if(features.loudness >= max_loudness)
                        max_loudness = features.loudness;
                    if(features.speechiness <= min_speechiness)
                        min_speechiness = features.speechiness;
                    if(features.speechiness >= max_speechiness)
                        max_speechiness = features.speechiness;
                    if(features.tempo <= min_tempo)
                        min_tempo = features.tempo;
                    if(features.tempo >= max_tempo)
                        max_tempo = features.tempo;
                    if(features.valence <= min_valence)
                        min_valence = features.valence;
                    if(features.valence >= max_valence)
                        max_valence = features.valence;
                }
            },
            function(err){
                console.log("Something went wrong!", err);
            }
        );
    }

    acousticness /= 50.0;
    danceability /= 50.0;
    energy /= 50.0;
    instrumentalness /= 50.0;
    key /= 50;
    liveness /= 50.0;
    loudness /= 50.0;
    speechiness /= 50.0;
    tempo /= 50.0;
    valence /= 50.0;

    let recs;
    spotify.getRecommendations({
        seed_tracks: trackSeeds,
        limit: 3,
        market: market,
        target_acousticness: acousticness,
        min_acousticness: min_acousticness,
        max_acousticness: max_acousticness,
        target_danceability: danceability,
        min_danceability: min_danceability,
        max_danceability: max_danceability,
        target_energy: energy,
        min_energy: min_energy,
        max_energy: max_energy,
        target_instrumentalness: instrumentalness,
        min_instrumentalness: min_instrumentalness,
        max_instrumentalness: max_instrumentalness,
        target_key: key,
        min_key: min_key,
        max_key: max_key,
        target_liveness: liveness,
        min_liveness: min_liveness,
        max_liveness: max_liveness,
        target_loudness: loudness,
        min_loudness: min_loudness,
        max_loudness: max_loudness,
        target_speechiness: speechiness,
        min_speechiness: min_speechiness,
        max_speechiness: max_speechiness,
        target_tempo: tempo,
        min_tempo: min_tempo,
        max_tempo: max_tempo,
        target_valence: valence,
        min_valence: min_valence,
        max_valence: max_valence
    }).then(
        function(data){
            recs = data.body.tracks;
            console.log(recs);
        },
        function(err){
            console.log("Something went wrong!", err);
        }
    );

});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));