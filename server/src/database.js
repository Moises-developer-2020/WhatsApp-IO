const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/WhatsApp-IO',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
    .then(db => console.log('Database is coneccted'))
    .catch(err => console.log('Error database'))