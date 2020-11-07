const SocketIO=require('socket.io')
const User=require('./models/user');

const webSocketServer={};
webSocketServer.init=(server)=>{

/***********************************************************/
    var usersConeccted={};//data the users connected
    var usersID=[];//ID of the users for deleted

    const io=SocketIO(server);
    io.on('connection',(socket)=>{

        
        //console.log('user connected', socket.id);
        socket.on('userConeccted',async (user)=>{
           
            usersConeccted[user._id]={//el id del usario conectado desde chat-content
                socketId:socket.id,//el socket cambia cada ves que recarga
                name:user.name,
                email:user.email,
                StateActived:true,
                newUserSelected:{}, //user selected in search-users
                userSelected:{}, //user selected for send messages
                MyContacts:[] //all users with whom I have messages
            }
            if(!usersID.includes(user._id)){//if it is not, add it
                usersID.push(user._id);
            }
            
            console.log( usersConeccted);
            console.log(usersID);
            console.log("usuarios: "+Object.keys(usersConeccted).length);
        });
        socket.on('disconnect',()=>{
            console.log("Disconnected: "+socket.id);
            const LtgConnected=Object.keys(usersConeccted).length;
            for(var i=0; i<LtgConnected; i++){
                if(usersID[i]){//if it exists
                   if(usersConeccted[usersID[i]]){
                       if(usersConeccted[usersID[i]].socketId==socket.id){
                            delete usersConeccted[usersID[i]];
                            usersID.splice(i,1);
                        }
                    }
                }
            }
            console.log(usersConeccted);
            console.log(usersID);
            

        });
        
        

        socket.on('user-selected',(data)=>{
            if(usersConeccted[data.MyID].newUserSelected){//add the user selected to my array
                usersConeccted[data.MyID].newUserSelected={
                    id:data.id
                }
            }
            console.log(usersConeccted);
            //console.log("myId: "+data.MyID+" id: "+data.id+" socketID: "+socket.id);
            
        })
        
        /**************** */
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