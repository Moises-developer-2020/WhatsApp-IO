const { set } = require('mongoose');
const SocketIO=require('socket.io')
const User=require('./models/user');
const MGMessages=require('./models/message');
const MGmyContacts=require('./models/myContacts');

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
                        }, 3000); //3s
                    },
                    stopDisconnection:function(){//stop desconnection of user
                        clearTimeout(this.time);
                    },
                    name:user.name,
                    email:user.email,
                    StateActived:true,
                   /* chatWindow:{//with the windows from user con el que esta chateando
                        //{user_id}
                    },*/
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
            //send my myContact 
            var mycontact=await MGmyContacts.findOne({_id_user:user._id},{"contacts":1,"_id":0});
            
            io.to(socket.id).emit('my-contact',mycontact);


            //console.log(mycontact);
           /* console.log( usersConeccted);
            console.log(usersID);
            console.log("usuarios: "+Object.keys(usersConeccted).length);*/
            
        });
        
        
        socket.on('user-selected',async (data)=>{//user selected on search or Mycontact
            
            var response={
                type:Boolean,// false=new, true=myContact 
                msm:{
                   // messages:[]
                }, //messages and data of users
                myId:null, //just to check who sent the message//solo para verifica quien envia el mensaje
                
            }
            if(usersConeccted[data.MyID]){//check if user connected
                const user= await User.findOne({_id:data.id},{"_id":1,"name":1,"email":1,"image":1});//check if user exists
                if(user){//if exist to user
                    var userId=data.id;//user selected

                    //add the user selected to my array
                    //for send message to the user selected
                    /*if(usersConeccted[data.MyID].sendMessage.cantMessageSend>0){ //if reload
                        var cantAnt=usersConeccted[data.MyID].sendMessage.cantMessageSend;
                        usersConeccted[data.MyID].sendMessage={
                            user,
                            cantMessageSend:cantAnt
                        };
                    }else{*/
                        usersConeccted[data.MyID].sendMessage={
                            user,
                            cantMessageSend:0
                        };
                   // }
                    //console.log(user);

                    //search if have msm with of user
                    const messages= await MGMessages.findOne({_id_user:data.MyID});
                    //deprecated
                   /* const messageSendWithoutRead=await MGmyContacts.findOne({_id_user:userId});
                   // console.log(messageSendWithoutRead);
                    var indexMessage=messageSendWithoutRead.contacts.findIndex(function(element){
                        return element._id_user == userId;
                    });
                    if(indexMessage != -1){
                        if(messageSendWithoutRead.contacts[indexMessage].message.cantMessageReceive){
                            usersConeccted[data.MyID].sendMessage.cantMessageSend=messageSendWithoutRead.contacts[indexMessage].message.cantMessageReceive;

                        }
                    }*/
                    //console.log(messages.toJSON().code_message)
                    var messageSendWithoutRead=0;
                    

                    if(messages.toJSON().code_message.length>0){//if have messages
                        for(var i=0; i<messages.toJSON().code_message.length;i++){
                            if(messages.toJSON().code_message[i]._id_user_receiver==userId){ //if have msm with user
                                usersConeccted[data.MyID].newUserSelected={state:false};//true is becouse no have msm with he
                                for(var m=0; m< messages.toJSON().code_message[i].data.length; m++){//get the cant of the messages without read;
                                    if(messages.toJSON().code_message[i].data[m].message.messages.read != "true"){
                                        messageSendWithoutRead++;
                                    }  
                                }
                                usersConeccted[data.MyID].sendMessage.cantMessageSend=messageSendWithoutRead;
                                console.log('withoutL '+messageSendWithoutRead);
                                response={
                                    type:true,
                                    msm:{//I sent all msm with this user
                                        user,
                                        messages:messages.toJSON().code_message[i]
                                    },
                                    myId:data.MyID
                                }
                                //console.log(messages.toJSON().code_message[i]);
                                break;
                            }else{
                                usersConeccted[data.MyID].newUserSelected={state:true};
    
                                response={
                                    type:false,
                                    msm:{
                                        user,
                                        messages:{
                                            data:[]
                                          }
                                    },
                                    myId:data.MyID
                                }
                                
                            }
                        }
                    }else{
                        usersConeccted[data.MyID].newUserSelected={state:true};
                        response={
                            type:false,
                            msm:{
                                user,
                                messages:{
                                    data:[]
                                }
                            },
                            myId:data.MyID
                        }
                    }
                
                }
                //console.log(user);
            }else{
                response={
                    type:false,
                    msm:{
                        user:{
                            name:"error to the get user",
                            //email:"error"
                        },
                        messages:{
                            data:[]
                        }
                    },
                    myId:""
                }
            }
           
           
            //send response to me
            io.to(socket.id).emit('reponse-user-selected',response);
            

           // console.log(usersConeccted[data.MyID]['MyContacts'][1]);
            //console.log(usersConeccted[data.MyID]['MyContacts'][0].id);
            //console.log("myId: "+data.MyID+" id: "+data.id+" socketID: "+socket.id);
            //console.log(usersConeccted);
           

        })
        
        socket.on('type-message',(user)=>{
            if(usersConeccted[user.userReceive]){//if it is connected //si esta conectado
                socket.to(usersConeccted[user.userReceive].socketId).emit('resp-type-message',{user:user.MyId,state:user.typeMessage});
            }

        });
        socket.on('send-message',async (message)=>{
           /* response={
              messageSend:false,//if to the message se envio
              chatWindow:false,//if esta chat con migo 'if esta en su ventana con migo'
            }*/
            var stateMSM={
                read:'send',
                image:'assets/public/icon/checked16px.png'
            }
            if(usersConeccted[message.MyId]){//if exist the user emisor
                if(usersConeccted[message.MyId].socketId == socket.id && usersConeccted[message.MyId].id != message.receiver){ //if socket id receive == my socket save
                    if(usersConeccted[message.MyId].sendMessage.user['_id'] == message.receiver){//id del user receiver
                        usersConeccted[message.MyId].sendMessage.cantMessageSend+=1;
                        var totalMessageSend=usersConeccted[message.MyId].sendMessage.cantMessageSend;
                        if(usersConeccted[message.MyId].newUserSelected.state){ //if is new user with me
                            //stateMessage
                            
                            //new user                                                    
                            var NewMessages={ //field 'code_message' the messages
                                _id_user_receiver:message.receiver,
                                image_user_receiver:"",                             
                                data:                                                  
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
                                                created_at:message.createAt,
                                                read:stateMSM.read, //leído  ,
                                                image:stateMSM.image                  
                                            }                                          
                        
                                        } 
                                    }                                            
                                                                                
                        
                            }  

                            var mycontact={
                                _id_user:message.receiver,
                                name:usersConeccted[message.MyId].sendMessage.user['name'],
                                message:{
                                    msm:message.msm,                            
                                    created_at:message.createAt,
                                    read:stateMSM.read,
                                    image:stateMSM.image,
                                    send:"Tú: ",
                                    cantMessageReceive:0
                                }
                            }
                            
                           // console.log(NewMessages[message.receiver].data[0].message);
                            //save for me 'user emisor'
                           await MGMessages.updateOne({_id_user:message.MyId},{$push:{code_message:NewMessages}});//add new field to code_message
                           await MGmyContacts.updateOne({_id_user:message.MyId},{$push:{contacts:mycontact}});

                           //saved for user receiver
                           NewMessages._id_user_receiver=message.MyId;
                           await MGMessages.updateOne({_id_user:message.receiver},{$push:{code_message:NewMessages}});//add new field to code_message
                           mycontact._id_user=message.MyId;
                           mycontact.name=usersConeccted[message.MyId].name;
                           mycontact.message.send="";
                           mycontact.message.cantMessageReceive=totalMessageSend;
                           await MGmyContacts.updateOne({_id_user:message.receiver},{$push:{contacts:mycontact}});

                           //console.log(newMsm);

                           usersConeccted[message.MyId].newUserSelected.state=false;//becouse it's not is new user with me

                           //send response to user receiver and to me
                           if(usersConeccted[message.receiver]){
                                io.to(socket.id).to(usersConeccted[message.receiver].socketId).emit('response-msm-sent',{
                                    message:NewMessages.data,
                                    contact:mycontact,
                                    emisor:message.MyId
                                });
                               // console.log(1.1);
                           }else{
                                io.to(socket.id).emit('response-msm-sent',
                                {   
                                    message:NewMessages.data,
                                    contact:mycontact
                                });
                               // console.log(1.2);

                           }

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
                                            created_at:message.createAt,
                                            read:stateMSM.read, //leído                                          
                                            image:stateMSM.image
                                        }                                          
                    
                                    } 
                                }   
                                
                                //update mycontacts with the new messages
                                var UpdateMyContact={
                                    _id_user:receiver,
                                    name:usersConeccted[message.MyId].sendMessage.user['name'],
                                    message:{
                                        msm:message.msm,                            
                                        created_at:message.createAt,
                                        read:stateMSM.read,//leido
                                        image:stateMSM.image,
                                        send:"Tú: ",
                                        cantMessageReceive:0//

                                    }
                                }
                            //aument new field to 'data' with the new message
                            ////save for me 'user emisor'
                            await MGMessages.updateOne({_id_user:message.MyId, 'code_message._id_user_receiver':receiver},{$push:{'code_message.$.data':MoreMessages}},{upsert:true});
                            await MGmyContacts.updateOne({_id_user:message.MyId,"contacts._id_user":receiver},{$set:{"contacts.$.name":UpdateMyContact.name,"contacts.$.message":UpdateMyContact.message}});
                           
                            //save for 'user receiver'
                            await MGMessages.updateOne({_id_user:receiver, 'code_message._id_user_receiver':message.MyId},{$push:{'code_message.$.data':MoreMessages}},{upsert:true});
                            UpdateMyContact._id_user=message.MyId;
                            UpdateMyContact.name=usersConeccted[message.MyId].name;
                            UpdateMyContact.message.send="";
                            UpdateMyContact.message.cantMessageReceive=totalMessageSend;
                            await MGmyContacts.updateOne({_id_user:receiver, 'contacts._id_user':message.MyId},{$set:{"contacts.$.name":UpdateMyContact.name,"contacts.$.message":UpdateMyContact.message}});

                            
                            //send response to user receiver and to me
                           if(usersConeccted[receiver]){
                            io.to(socket.id).to(usersConeccted[receiver].socketId).emit('response-msm-sent',{
                                message:MoreMessages,
                                contact:UpdateMyContact,
                                emisor:message.MyId
                            });
                            //console.log(2.1);

                           }else{
                            io.to(socket.id).emit('response-msm-sent',{
                                message:MoreMessages,
                                contact:UpdateMyContact
                            });
                           // console.log(2.2);

                           }
                        }
                        console.log(totalMessageSend);

                    }
                }
            }

            //console.log(message);
            //console.log(CryptoJS.AES.decrypt(message.msm,KeyCryptoJS).toString(CryptoJS.enc.Utf8));
            
            //io.to(usersConeccted[message.MyId].socketId).to(message.receiver).emit('response-msm-sent',CryptoJS.AES.decrypt(message.msm,KeyCryptoJS).toString(CryptoJS.enc.Utf8));
        });

        socket.on('state-message-views',async (user)=>{//estado que se envia cada ves que el usuario ve el mensaje que ha recibido
            console.log('on');
                if(usersConeccted[user.myId]){
                    console.log('I Connected');
                    const userReceive= await User.findOne({_id:user.id_receive},{"_id":1,"name":1,"email":1,"image":1});//check if user exists

                        if(userReceive){
                            console.log('receive');
                            if(usersConeccted[user.myId].sendMessage.user['_id'] == user.id_receive){
                                console.log('if is user receive');
                                let imagen="assets/public/icon/sonreir.svg";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                                //const l=await MGMessages.updateOne({_id_user:user.myId, 'code_message._id_user_receiver':user.id_receive,'code_message.data.message.messages.read':false},{$set:{"code_message.$.image_user_receiver":"not fount","code_message.$.data":{"data.$.message":{"message.$.messages":{"messages.$.read":{"read":"true"}}}}}});
                                const l=await MGMessages.findOne({_id_user:user.myId,'code_message._id_user_receiver':user.id_receive});
                                if(l){
                                    console.log('l here');
                                    var setStateMenssage=[];
                                    setStateMenssage=l.toJSON();
                                    //console.log(setStateMenssage.code_message.length);
                                    let index=0;
                                    for(let i=0; i<setStateMenssage.code_message.length;i++){
                                        if(setStateMenssage.code_message[i]){//if have message
                                            if(setStateMenssage.code_message[i]._id_user_receiver == user.id_receive){//optener el indice del usuario seleccionado
                                                index=i;
                                                for (let p = 0; p < setStateMenssage.code_message[index].data.length; p++) {//update the state to read[leido]
                                                    
                                                    setStateMenssage.code_message[index].data[p].message.messages.read="true";
                                                    setStateMenssage.code_message[index].data[p].message.messages.image=imagen;
                                                    //console.log(setStateMenssage.code_message[index].data[p].message);
                                                
                                                };
                                                break;//una vez encuentra el indice lo detengo
                                            };
                                        }
                                    };             
                                    //console.log(l.toJSON().code_message[1].data[2].message.messages);
                                    //console.log(setStateMenssage);
                                    //console.log(index);
                                    
                                    //for update in mycontacts
                                    let totalMessageSEnd=usersConeccted[user.myId].sendMessage.cantMessageSend;
                                    var contacts = 
                                    {  
                                        read : "true",
                                        image : imagen,
                                        cantMessageReceive:totalMessageSEnd

                                    };
                                

                                    //****PONER QUE CTUALIZE MIS CONTACTOS TAMBEIN**********
                                
                                    const dataUpdate=setStateMenssage.code_message[index].data;
                                    /*//update for me
                                    const updateDataFromMessage=await MGMessages.updateOne({_id_user:user.myId, 'code_message._id_user_receiver':user.id_receive},{$set:{"code_message.$.data":dataUpdate}});                    
                                    const UpdateREADMyContacts=await MGmyContacts.updateOne({_id_user:user.myId, 'contacts._id_user':user.id_receive},{$set:{"contacts.$.message.read":contacts.read,"contacts.$.message.image":contacts.image}});
                                    */
                                    //update for user_selected
                                    const updateDataFromReceive=await MGMessages.updateOne({_id_user:user.id_receive, 'code_message._id_user_receiver':user.myId},{$set:{"code_message.$.data":dataUpdate}});                    
                                    const UpdateREADMyContactsFromReceive=await MGmyContacts.updateOne({_id_user:user.id_receive, 'contacts._id_user':user.myId},{$set:{"contacts.$.message.read":contacts.read,"contacts.$.message.image":contacts.image, "contacts.$.message.cantMessageReceive":contacts.cantMessageReceive}});

                                    const UpdateREADMyContacts=await MGmyContacts.updateOne({_id_user:user.myId, 'contacts._id_user':user.id_receive},{$set:{"contacts.$.message.cantMessageReceive":0}});

                                    //in the response 
                                    //'state':true is for style of the messages
                                    //'state':false only style in mycontacts
                                    if(usersConeccted[user.id_receive]){//if user_receive is connected 
                                        if(usersConeccted[user.id_receive].sendMessage.user){
                                            if(usersConeccted[user.id_receive].sendMessage.user['_id'] == user.myId ){//the send only if esta conectadp con migo
                                                //update for me
                                                contacts.cantMessageReceive=0;
                                                usersConeccted[user.myId].sendMessage.cantMessageSend=0;
                                                const updateDataFromMessage=await MGMessages.updateOne({_id_user:user.myId, 'code_message._id_user_receiver':user.id_receive},{$set:{"code_message.$.data":dataUpdate}});                    
                                                //const UpdateREADMyContacts=await MGmyContacts.updateOne({_id_user:user.myId, 'contacts._id_user':user.id_receive},{$set:{"contacts.$.message.read":contacts.read,"contacts.$.message.image":contacts.image, "contacts.$.message.cantMessageReceive":contacts.cantMessageReceive}});
                                                const UpdateREADMyContacts=await MGmyContacts.updateOne({_id_user:user.myId, 'contacts._id_user':user.id_receive},{$set:{"contacts.$.message.read":contacts.read,"contacts.$.message.image":contacts.image}});
                                                
                                                io.to(usersConeccted[user.myId].socketId).to(usersConeccted[user.id_receive].socketId).emit('response-state-message-views',{
                                                    state:true,//with me
                                                    emisor:user.myId,
                                                    receptor:user.id_receive,
                                                    connected:true
                                                });
                                            }else{
                                                io.to(usersConeccted[user.myId].socketId).to(usersConeccted[user.id_receive].socketId).emit('response-state-message-views',{
                                                    state:false,
                                                    emisor:user.myId,
                                                    receptor:user.id_receive,
                                                    connected:true
                                                });
                                            };
                                        }else{
                                            io.to(usersConeccted[user.myId].socketId).to(usersConeccted[user.id_receive].socketId).emit('response-state-message-views',{
                                                state:false,
                                                emisor:user.myId,
                                                receptor:user.id_receive,
                                                connected:true
                                            });
                                        };
                                    }else{
                                        io.to(usersConeccted[user.myId].socketId).emit('response-state-message-views',{
                                            state:false,
                                            emisor:user.myId,
                                            receptor:user.id_receive,
                                            connected:false
                                        });
                                    }
                                }
                            }   
                        }
                    
    
                }
            
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