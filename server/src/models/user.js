const {Schema, model} = require('mongoose');

const UserSchema= new Schema({
    name:String,
    email:String,
    password:String,
    image:String
},{
    timestamps:true,
    versionKey:false
});

module.exports=model('User',UserSchema);