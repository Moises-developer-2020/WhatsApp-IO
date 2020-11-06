const SocketIO=require('socket.io')

const webSocketServer={};
webSocketServer.init=(server)=>{

/***********************************************************/

    const io=SocketIO(server);


   
    io.on('connection',(socket)=>{
        console.log('user connected', socket.id);
        
    });



    /****************************************************************/

}
module.exports=webSocketServer;