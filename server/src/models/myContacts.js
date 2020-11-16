const {Schema, model} =require('mongoose');

const MyContactsSchema= new Schema({
 
    _id_user:String,
    name:String,
    contacts:Array 
    
},{
    timestamps:true,
    versionKey:false
})

module.exports=model('myContacts',MyContactsSchema);


/*
myContacts=[
    {
        _id_user:"",
        name:"",
        contacts:[
            
        ]  
    }
]
*/