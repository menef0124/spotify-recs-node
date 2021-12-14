const express = require('express');
const path = require('path');
const session = require('express-session');

//Load middleware
const hbs = require('express-handlebars');

//Requires User class
User = require('./models/user');

const PORT = 8080;

let app = express();

app.get('/', (req, res) =>{
    console.log("Hello");
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));