const {Schema, model} =require('mongoose');

const MessageSchema= new Schema({

    _id_user:String,
    name:String,
    code_message:Array  
       
    
},{
    timestamps:true,
    versionKey:false
})

module.exports=model('message',MessageSchema);


/*
messages=[
    {
        _id_user:"",
        name:"",
        code_message:[
            
            /////////////////////////////////////////////////////////////////////////////////
            {                                                                               /
                "*_id de usuario receptor*":{                                               /
                    image_user_receptor:"",                                                 /
                    data:                                                                   /
                    [                                                                       /
                        /////////////////////////////////////////////                       /
                        {                                           /                       /
                            _id_user_emisor:"",                     /                       /
                            _id_user_receptor:"",                   /                       /
                            message:{                               /  esto se repetira     / Esto se repetira
                                file:{                              /  por cada mensaje     / por cada usuario
                                    docs:[{}],                      /  que envie o reciva   / distinto con el que
                                    image:[{}]                      /  de este usuario      / tenga conversacion
                                },                                  /  receptor             /
                                messages:{                          /                       /
                                    msm:"",                         /                       /
                                    created_at:""                   /                       /
                            }                                       /                       /
                                                                    /                       /
                        }                                           /                       /
                        ////////////////////////////////////////////                        /
                    ],                                                                      /
                    configChat:
                    [
                        {
                            background:""
                        }
                    ]                                                                       /
                }                                                                           /
            }                                                                               /
            ////////////////////////////////////////////////////////////////////////////////
            
        ]  
    }
]
*/