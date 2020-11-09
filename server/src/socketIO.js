const { set } = require('mongoose');
const SocketIO=require('socket.io')
const User=require('./models/user');

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
        
        
        socket.on('user-selected',async (data)=>{
            var resp={
                exist:false,
                MyContacts:false,
                newUser:false
            }

            const user= await User.findOne({_id:data.id},{"_id":1,"name":1,"email":1});//check if user exists

            if(user){
                if(usersConeccted[data.MyID]['MyContacts'][1].id != data.id){//check if it`s in my contacts
                    if(usersConeccted[data.MyID].newUserSelected){//add the user selected to my array
                        usersConeccted[data.MyID].newUserSelected={
                            user
                        }
                        socket.emit('messages-user-selected',' it`s not in my contacts ');
                    }
                }else{
                    socket.emit('messages-user-selected',' it`s in my contacts ');
                }
            }
           // console.log(usersConeccted[data.MyID]['MyContacts'][1]);
            //console.log(usersConeccted[data.MyID]['MyContacts'][0].id);
            //console.log(usersConeccted[data.MyID]);
           // console.log(user);
            //console.log("myId: "+data.MyID+" id: "+data.id+" socketID: "+socket.id);
            console.log(usersConeccted);
           

        })
        

        /**************** */
        socket.on('disconnect',()=>{//for each disconnected user
            console.log("Disconnected: "+socket.id);
            
            const LtgConnected=Object.keys(usersConeccted).length;
            for(var i=0; i<LtgConnected; i++){
                if(usersID[i]){//if it exists
                    if(usersConeccted[usersID[i]]){
                        if(usersConeccted[usersID[i]].socketId==socket.id){
                            usersConeccted[usersID[i]].disconnection();//execute desconnection time
                        }
                    }
                }
            }
           
           
           
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