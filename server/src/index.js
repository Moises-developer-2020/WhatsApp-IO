const express = require('express');
const morgan = require('morgan');
const cors =require('cors');

//initialitation
const app= express();
require('./database');

//variables
app.set('port', process.env.PORT || 3000);

//Midleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({origin:'http://localhost:4200'}));
//router
app.use('/api',require('./routers/login/login.signup'));
app.use('/api',require('./routers/login/login.signin'));

app.use('/api',require('./routers/chat/chat.chat'));

//Server
app.listen(app.get('port'),()=>{
    console.log('Server on port ', app.get('port'));
});