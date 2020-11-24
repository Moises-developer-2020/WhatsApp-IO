const {Schema, model} =require('mongoose');

const MessageSchema= new Schema({

   /* _id_user:String,
    name:String, 
    code_message:Array */ 
    _id_user:String,
    name:String, 
    code_message:[
        {
            _id_user_receiver:String,
            image_user_receiver:String,                             
            data:                                               
            [                                                   
                {                                              
                    _id_user_emisor:String,                        
                    _id_user_receptor:String,                      
                    message:{                              
                        file:{                             
                            docs:[],                        
                            image:[]                       
                        },                                    
                        messages:{                             
                            msm:String,                            
                            created_at:String,
                            read:String,
                            image:String                      
                        }                                          
    
                    } 
                }                                            
            ]
        }
    ]
       
    
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