const { set } = require('mongoose');
const SocketIO=require('socket.io')
const User=require('./models/user');
const MGMessages=require('./models/message');

const CryptoJS=require('crypto-js');
const { $where, updateOne } = require('./models/user');
const KeyCryptoJS="Message";

const webSocketServer={};
var usersConeccted={};//data the users connected
var usersID=[];//ID of the users for deleted

webSocketServer.init=(server)=>{
    //console.log(Object.keys(io.engine.clients));
/***********************************************************/
    

    const io=SocketIO(server);
    io.on('connection',(socket)=>{

        //console.log('user connected', socket.id);
        socket.on('userConeccted',async (user)=>{

           if(usersConeccted[user._id]){//if exist only delete disconnection.delay and his value =null
                
                usersConeccted[user._id].stopDisconnection();
                usersConeccted[user._id].socketId=socket.id;//update socket.id of this users
                
            }else{
                usersConeccted[user._id]={//el id del usario conectado desde chat-content
                    id:user._id,
                    socketId:socket.id,//el socket cambia cada ves que recarga
                    time:null,
                    disconnection:function(){//time of desconection, event 'disconnect' of the socket
                        this.time=setTimeout(() => {
                            delete usersConeccted[this.id]
                            var ud=usersID.indexOf(this.id);
                            usersID.splice(ud,1)
                            console.log("delete: ", this.name);
                        }, 3000);
                    },
                    stopDisconnection:function(){//stop desconnection of user
                        clearTimeout(this.time);
                    },
                    name:user.name,
                    email:user.email,
                    StateActived:true,
                    newUserSelected:{}, //user selected in search-users
                    userSelected:{}, //user selected for send messages
                    sendMessage:{},//id of the user to whom i will send the message 
                    MyContacts:[
                        {id:1},
                        {id:2}
                    ] //all users with whom I have messages
                    /*MyContacts:[
                        {
                            id:
                        },
                        {
                            id
                        }
                    ] */
                }
            
            }


            if(!usersID.includes(user._id)){//if it is not, add it
                usersID.push(user._id);
            }
            
            console.log( usersConeccted);
            console.log(usersID);
            console.log("usuarios: "+Object.keys(usersConeccted).length);
            
        });
        
        
        socket.on('user-selected',async (data)=>{//user selected on search or Mycontact
            var response={
                type:Boolean,// false=new, true=myContact 
                msm:null, //messages or data of users
                myId:null, //just to check who sent the message//solo para verifica quien envia el mensaje
                messages:[]
            }
            if(usersConeccted[data.MyID]){//check if user connected
                const user= await User.findOne({_id:data.id},{"_id":1,"name":1,"email":1});//check if user exists
                if(user){//if exist to user
                    var userId=data.id;

                    //add the user selected to my array
                    usersConeccted[data.MyID].sendMessage={user};//for send message to the user selected
                    

                    //search if have msm with of user
                    const messages= await MGMessages.findOne({_id_user:data.MyID});
                    console.log(messages.toJSON().code_message)
                    
                    
                    

                    if(messages.toJSON().code_message.length>0){//if have messages
                        for(var i=0; i<messages.toJSON().code_message.length;i++){
                            if(messages.toJSON().code_message[i]._id_user_receiver==userId){ //if have msm with user
                                usersConeccted[data.MyID].newUserSelected={state:false};
                                response={
                                    type:true,
                                    msm:user,//I sent all msm with this user
                                    myId:data.MyID,
                                    messages:messages.toJSON().code_message[i]
                                
                                }
                                break;
                            }else{
                                usersConeccted[data.MyID].newUserSelected={state:true};
    
                                response={
                                    type:false,
                                    msm:user,
                                    myId:data.MyID
                                }
                                
                            }
                        }
                    }else{
                        usersConeccted[data.MyID].newUserSelected={state:true};
                        response={
                            type:false,
                            msm:user,
                            myId:data.MyID
                        }
                    }
                
                }
            }
           
            //console.log(response);
            //send response to me
            io.to(socket.id).emit('reponse-user-selected',response);


           // console.log(usersConeccted[data.MyID]['MyContacts'][1]);
            //console.log(usersConeccted[data.MyID]['MyContacts'][0].id);
            //console.log("myId: "+data.MyID+" id: "+data.id+" socketID: "+socket.id);
            //console.log(usersConeccted);
           

        })
        
        socket.on('send-message',async (message)=>{
            response={
                error:false,
                sent:false,
                userConeccted:false,
                existUser:false,
                existReceptor:false,
            }

            if(usersConeccted[message.MyId]){//if exist the user emisor
                if(usersConeccted[message.MyId].socketId == socket.id){ //if socket id receive == my socket save
                    if(usersConeccted[message.MyId].sendMessage.user['_id'] == message.receiver){//id del user receiver
                        if(usersConeccted[message.MyId].newUserSelected.state){ //if is new user with me
                            //new user                                                    
                            var NewMessages={ //field 'code_message' the messages
                                _id_user_receiver:message.receiver,
                                image_user_receiver:"",                             
                                data:                                               
                                [                                                   
                                    {                                              
                                        _id_user_emisor:message.MyId,                        
                                        _id_user_receptor:message.receiver,                      
                                        message:{                              
                                            file:{                             
                                                docs:[],                        
                                                image:[]                       
                                            },                                    
                                            messages:{                             
                                                msm:message.msm,                            
                                                created_at:message.createAt                      
                                            }                                          
                        
                                        } 
                                    }                                            
                                ]                                                 
                        
                            }  
                                
                           // console.log(NewMessages[message.receiver].data[0].message);

                           const newMsm= await MGMessages.updateOne({_id_user:message.MyId},{$push:{code_message:NewMessages}});//add new field to code_message
                           console.log(newMsm);
                           usersConeccted[message.MyId].newUserSelected.state=false;//becouse it's not is new user with me
                        }else{
                            //friend                                                    
                            var receiver=message.receiver;
                            var MoreMessages={};//field 'data' the messages
                            MoreMessages={
                                    _id_user_emisor:message.MyId,                      
                                    _id_user_receptor:message.receiver,                      
                                    message:{                              
                                        file:{                             
                                            docs:[{}],                        
                                            image:[{}]                       
                                        },                                    
                                        messages:{                             
                                            msm:message.msm,                            
                                            created_at:message.createAt                      
                                        }                                          
                    
                                    } 
                                }                                            
                            //aument new field to 'data' with the new message
                            const MoreMsm= await MGMessages.updateOne({_id_user:message.MyId, 'code_message._id_user_receiver':receiver},{$push:{'code_message.$.data':MoreMessages}},{upsert:true});
                            console.log(MoreMsm);
                            /*const newMSM=MoreMsm.toJSON().code_message[0];
                            newMSM.data.push(MoreMessages);
                            var NewMSM=[receiver]={newMSM};
                            const kl=await MGMessages.findOneAndUpdate({"_id_user":message.MyId, "code_message._id_user_receiver":receiver},{$push:{"code_message.data":NewMSM}});
                            console.log(kl);*/
                            //console.log(newMSM);

                        }
                    }
                }
            }

            //console.log(message);
            //console.log(CryptoJS.AES.decrypt(message.msm,KeyCryptoJS).toString(CryptoJS.enc.Utf8));
            
            //io.emit(usersConeccted[message.MyId].socketId).emit('response-msm-sent',CryptoJS.AES.decrypt(message.msm,KeyCryptoJS).toString(CryptoJS.enc.Utf8));
        });

        /**************** */
        socket.on('disconnect',()=>{//for each disconnected user
            console.log("Disconnected: "+socket.id);
            
            const LtgConnected=Object.keys(usersConeccted).length;
            for(var i=0; i<LtgConnected; i++){
                if(usersID[i]){//if it exists
                    if(usersConeccted[usersID[i]]){
                        if(usersConeccted[usersID[i]].socketId==socket.id){
                            usersConeccted[usersID[i]].disconnection();//execute desconnection time
                            break;
                        }
                    }
                }
            }
            //add on break;
           
           //event only me send one message
           
           /* console.log(usersConeccted);
            console.log(usersID);*/
           // console.log(ip);

        });

        socket.on('error',(error)=>{
            console.log('error de en  socket'+error);
        })
        socket.on('connect_error',(error)=>{
            console.log('error de conexion en socket'+error);
        })
        /*********************** */
    });

    /****************************************************************/

}
module.exports=webSocketServer;