import { Component, OnInit } from '@angular/core';
import { ChatService } from "../../../services/chat/chat.service";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import { UserSelected } from "../../../models/userSelected";

import * as CryptoJS from "crypto-js";
import { DomSanitizer } from '@angular/platform-browser';
import { AuthServiceService } from '../../../services/login/auth-service.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  private KeyCryptoJS="Message";

 UserSelectedResponse:UserSelected={
   type:true,//true have msm with me, false is new user
   msm:{
    user:{
      _id:"",
      name:"",
      email:"",
      image:""
    },
     messages:{
       data:[]
     }
   },
   myId:""
  };

  Message;
  ResptypeMessage=false;
  count=0;//for type-message
  stateMessage={
    sending:{
      state:false,
      image:'assets/public/icon/checkSending.png'
    },
    send:{
      state:false,
      image:'assets/public/icon/checked16px.png'
    },
    error:{
      state:false,
      image:'assets/public/icon/error.png'
    },
    view:{
      state:false,
      image:'assets/public/icon/sonreir.svg'
    }
  }

  countMessage:number=0;
  constructor(private chatService:ChatService,
    private webSocketService:WebSocketService,
    private sanitizer: DomSanitizer,
    private authService:AuthServiceService) { }

  ngOnInit(): void {

    if(this.authService.refreshToken()){
      this.webSocketService.listen('reponse-user-selected')//resp from user selected
      .subscribe(res=>{
        this.UserSelectedResponse=res as UserSelected;
       // console.log(this.UserSelectedResponse);
        this.readAndViewMessage();

        setTimeout(() => {
          this.styleMessages();
          this.styleMessageSendNow('load');
        }, 10);
      });
      /**************************************************************************** */
      this.webSocketService.listen('resp-type-message')//resp from type-message
      .subscribe(res=>{
        if(this.UserSelectedResponse.msm.user._id == res.user){
          if(res.state){
            this.ResptypeMessage=true;
          }else{
            this.ResptypeMessage=false;
          }
        }
        //or  this.ResptypeMessage=res;
      })
      /**************************************************************************** */

      
      this.webSocketService.listen('response-msm-sent')//resp from message send
      .subscribe(res=>{
       console.log(res);
        

        //paint the message send  
          var message={
            message:{
              file:{
                docs: [],
                image: []
              },
              messages:{
                created_at: "",
                msm:""
              },
              _id_user_emisor:"",
              _id_user_receptor:""
            }
        }
        message=res.message;
        
        if(res.message._id_user_emisor==this.UserSelectedResponse.myId){//if I am the one who sent the message
          //yo envie el mensaje;
          this.readAndViewMessage();
          setTimeout(() => {
            this.styleMessageSendNow();
            this.styleMessageSendNow('send');//paint the image send
          }, 1);
          console.log("I");
          

        }else{//put send in the user receive //poner enviado en el usuario receptor
          //paint msm in the pantalla user receive
          if(this.UserSelectedResponse.msm.user._id == res.emisor){
            //console.log('i find with he');
            
            this.UserSelectedResponse.msm.messages.data.push(message);
          }else{//only paint in mycontacts
            //console.log('without he');
           //console.log("emisor: "+res.emisor);
            //console.log("I: "+this.UserSelectedResponse.myId);
            
          }        
        }
        setTimeout(() => {
          this.styleMessages();
         }, 1);
        
      });

      this.webSocketService.listen('response-state-message-views')
      .subscribe(res=>{
        if(res.state){
          this.styleMessageSendNow('MessageRead');
        }
        
      })


    }
    
  }
  sendMessage(msm:HTMLDivElement){

    this.typeMessage(false);

    var NewMessage={
      MyId:this.UserSelectedResponse.myId,
      receiver:this.UserSelectedResponse.msm.user._id,
      msm:CryptoJS.AES.encrypt(this.Message,this.KeyCryptoJS).toString(),
      read:'sending',
      image:'assets/public/icon/checkSending.png',
      //msm:this.Message,
      createAt:new Date()
    }

    //paint the message send  
    var message={
        message:{
          file:{
            docs: [],
            image: []
          },
          messages:{
            created_at: NewMessage.createAt,
            msm: NewMessage.msm,
            read:'sending',
            image:'assets/public/icon/checkSending.png'
          },
          _id_user_emisor: NewMessage.MyId,
          _id_user_receptor: NewMessage.receiver
        }
    }
    //console.log(message);
    this.UserSelectedResponse.msm.messages.data.push(message);
    //console.log(this.UserSelectedResponse.msm.messages.data);
    

    //send the msm to socket
    try {
     //setTimeout(() => {
      this.webSocketService.emit('send-message',NewMessage);
      //console.log(this.UserSelectedResponse.msm.messages.data.length);
      
     /* this.UserSelectedResponse.msm.messages.data.splice((this.UserSelectedResponse.msm.messages.data.length-1),1);
      message.message.messages.read='send';
      this.UserSelectedResponse.msm.messages.data.push(message);*/
     //}, 3000);
    } catch (error) { }

    this.Message='';
    msm.scrollTop=msm.scrollHeight;
    
    setTimeout(() => {
     this.styleMessages();
    }, 1);
   
    
  }

  typeMessage(msm:any){//tipea mensaje ...
    
     //to send it only once
    var send={
      userReceive:this.UserSelectedResponse.msm.user._id,
      MyId:this.UserSelectedResponse.myId,
      typeMessage:false,
    }
  
    
    if(msm.target){
      if(msm.target.value.length>0){
        send.typeMessage=true;
        this.count++;
        
      }else{
        send.typeMessage=false;
        this.count=0;
      }
    }
    if(!msm){//send with msm clean
      this.count=0;
      send.typeMessage=false;
    }
    
    

    if(this.count== 0 || this.count == 1){//send only once if es true or false
      this.webSocketService.emit('type-message',send);
    }
    

   
  };

  readAndViewMessage(){//state-message-views in socketIO
    var user={
      id_receive:this.UserSelectedResponse.msm.user._id,//receive
      myId:this.UserSelectedResponse.myId
    }

    this.webSocketService.emit('state-message-views',user);
    
  }

  decryptMessage(message){
    try {
      return CryptoJS.AES.decrypt(message,this.KeyCryptoJS).toString(CryptoJS.enc.Utf8);
      
    } catch (error) {
      return message;      
    }
  }
  styleMessageSendNow(state?){//update state message when send message
      //delete state message
      var show_messages=document.querySelector('.show-messages');
      
      let longitud =this.UserSelectedResponse.msm.messages.data.length;
      if(state=="load"){
        for(var i=0; i<longitud;i++){
         // console.log(i);
            if(state=='load'){//response to the user selected
              if(show_messages.children.item(i).children.item(0).className=="show-messages-right"){
                //console.log(show_messages.children.item(i).children.item(0));
              
                if(show_messages.children.item((i+1))){
                  if(show_messages.children.item((i-1))){
                    if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-right" &&
                        show_messages.children.item((i-1)).children.item(0).className=="show-messages-right"){
                        if(this.UserSelectedResponse.msm.messages.data[i].message.messages.read == "true"){
                          show_messages.children.item(i).children.item(0).children.item(1).setAttribute('hidden','true');//delete state image -div center-

                        }

                    } 
                    if(show_messages.children.item((i-1)).children.item(0).className=="show-messages-left" &&
                        show_messages.children.item((i+1)).children.item(0).className=="show-messages-right"){
                        
                        show_messages.children.item(i).children.item(0).children.item(1).setAttribute('hidden','true');//delete state image -first div -

                    } 
                  }
                }
                //delete img to the first message state-img
                if(!show_messages.children.item((i-2))){
                  if(this.UserSelectedResponse.msm.messages.data[0].message.messages.read == "true"){
                    show_messages.children.item(1).children.item(0).children.item(1).setAttribute('hidden','true');//delete state image -first div -
                  }
                }
              }
            }

        }
      }
      var df=0;
      if(state=='MessageRead' || state=="send"){
        
        for(var i=0; i<longitud;i++){
          if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-right"){
            if(this.UserSelectedResponse.msm.messages.data[i].message.messages.read == "send" || this.UserSelectedResponse.msm.messages.data[i].message.messages.read == "sending"){
              df++;
              console.log("df: "+df);
              
            }
          }
        }
      }
      var longitudMessage=this.UserSelectedResponse.msm.messages.data.length;
      //this.countMessage= longitudMessage>5 ? (longitudMessage-5): longitudMessage;//only 5 repeat execute
      //this.countMessage= longitudMessage>5 ? (longitudMessage-df): longitudMessage;//only 5 repeat execute
      this.countMessage= longitudMessage-df//only 5 repeat execute
     
      if(state=="MessageRead" || state=="send"){
        for(var i=this.countMessage; i<longitud;i++){
          
          console.log("df: "+df+" i: "+i+" users:"+this.UserSelectedResponse.msm.messages.data.length);

          if(state=='MessageRead'){
            if(this.UserSelectedResponse.msm.messages.data[i].message.messages.image){              
              if(this.UserSelectedResponse.msm.messages.data[i].message.messages.read != "true"){
                if(show_messages.children.item((i+1))){//cuando me envian un mensaje 
                  if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-left"){
                      this.UserSelectedResponse.msm.messages.data[i].message.messages.image=this.stateMessage.view.image;//delete image send for view
                      this.UserSelectedResponse.msm.messages.data[i].message.messages.read="Read";//change send
                      console.log('hix3');
                  }else{

                    if( show_messages.children.item(i).children.item(0).children.item(1).className=="State-message"){
                      show_messages.children.item(i).children.item(0).children.item(1).setAttribute('style','display:none');//delete state image -div center-
                      console.log('hi');
                      
                    }
                    console.log('hix2');

                    this.UserSelectedResponse.msm.messages.data[longitud-1].message.messages.image=this.stateMessage.view.image;
                    this.UserSelectedResponse.msm.messages.data[longitud-1].message.messages.read="Read";
                    
                  }
                }

                //**********caducated for /'info user class="show-message-new-user"'/ visible*********
              /*if(show_messages.children.item((i-1))){ 
                if(show_messages.children.item((i-1)).children.item(0)){
                  if(show_messages.children.item((i-1)).children.item(0).children.item(1)){
                    if(show_messages.children.item((i-1)).children.item(0).children.item(1).className=="State-message"){
                      //show_messages.children.item((i-1)).children.item(0).children.item(1).setAttribute('style','display:none');//delete state image -div center-
                      console.log("hix4");
                      
                    }
                  }
                }
              }*/
                this.UserSelectedResponse.msm.messages.data[longitud-1].message.messages.image=this.stateMessage.view.image;//paint image user_receive
                this.UserSelectedResponse.msm.messages.data[i].message.messages.read='Read';
                
                
              }
            }
            
          }
          if(state=='send'){
            if(this.UserSelectedResponse.msm.messages.data[i].message.messages.image){  
              if(this.UserSelectedResponse.msm.messages.data[i].message.messages.read != "true"){  
                if( this.UserSelectedResponse.msm.messages.data[i].message.messages.image==this.stateMessage.sending.image){
                  this.UserSelectedResponse.msm.messages.data[i].message.messages.image=this.stateMessage.send.image;
                  this.UserSelectedResponse.msm.messages.data[i].message.messages.read='send';

                }
              
                
              }

            }
          }
        }
      }
      //console.log('styleNow');

  }
  styleMessages(){
    
    var show_messages=document.querySelector('.show-messages');
    show_messages.scrollTop=show_messages.scrollHeight;
    //console.log(show_messages.children.length)
    //style for the messages
    var longtMessages=show_messages.children.length;
    for(var i=0; i<show_messages.children.length;i++){
        if(show_messages.children.item(i).children.item(0).className=="show-messages-right"){
          if(show_messages.children.item((i+1))){
              if(show_messages.children.item((i+1)).children.item(0)){
                if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-right"){
                      
                  show_messages.children.item((i+1)).children.item(0).setAttribute("style","margin-top: -14px;"); //delete padding 'div center'
                  show_messages.children.item((i+1)).children.item(0).children.item(0).setAttribute("style","border-radius:5px 2px 2px 5px;"); //delete div:children border-radius 'div center'
      
                  if(show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0) && show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0).className=="toggle-right"){
                    show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0).remove(); //delete toggle-right
                  }
      
                  if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0)){
                    if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0).className=="toggle-right"){
                      show_messages.children.item((i)).children.item(0).children.item(0).setAttribute("style"," border-radius:10px 0 4px 5px;"); //delete border-radius 'first div'
                      
                    } 
                  } 
                }else{
                    
                  
                  if(show_messages.children.item((i-1))){
                    if(show_messages.children.item((i-1)).children.item(0).className=="show-messages-right"){
                      show_messages.children.item((i)).children.item(0).children.item(0).setAttribute("style","border-radius:5px 4px 10px 10px;"); //add border-radius 'last div'
                    }
                  }
                  // show_messages.children.item((i+1)).children.item(0).setAttribute("style","background:green;"); //delete padding
                }
              }
            }
          
        }
      

      if(show_messages.children.item(i).children.item(0).className=="show-messages-left"){
        if(show_messages.children.item((i+1))){
          if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-left"){
                    
            show_messages.children.item((i+1)).children.item(0).children.item(1).setAttribute("style","border-radius:4px 5px 5px 4px; margin: 0 29px;"); //delete div:children border-radius 'div center'
           
            if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0)){//are for validate if exist
              show_messages.children.item((i)).children.item(0).children.item(0).children.item(0).remove(); //delete img receptor

            }
            if(show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0) && show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0).className=="toggle-left"){
              show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0).remove(); //delete toggle
            }

           if(show_messages.children.item((i)).children.item(0).children.item(1).children.item(0)){
              if(show_messages.children.item((i)).children.item(0).children.item(1).children.item(0).className=="toggle-left"){
                show_messages.children.item((i)).children.item(0).children.item(1).setAttribute("style"," border-radius:5px 10px 4px 4px;  margin: 0 29px;"); //delete border-radius 'first div'
                
              } 
           }

            
          }else{
                            
           if(show_messages.children.item((i-1))){
              if(show_messages.children.item((i-1)).children.item(0).className=="show-messages-left"){
                show_messages.children.item((i)).children.item(0).children.item(1).setAttribute("style","border-radius:5px 4px 10px 10px;  "); //add border-radius 'last div'
              }
           }

          }
        }
      }

      //style the last div 
      if(show_messages.children.item((longtMessages-1)).children.item(0)){
        if(show_messages.children.item((longtMessages-2))){
          if(show_messages.children.item((longtMessages-2)).children.item(0)){
            if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-left" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-left"){
              show_messages.children.item((longtMessages-1)).children.item(0).children.item(1).setAttribute("style","border-radius:5px 4px 10px 10px; ")

            }
          }
        }
      }
      if(show_messages.children.item((longtMessages-1)).children.item(0)){
        if(show_messages.children.item((longtMessages-2))){
          if(show_messages.children.item((longtMessages-2)).children.item(0)){
            if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-right" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-right"){
             show_messages.children.item((longtMessages-1)).children.item(0).children.item(0).setAttribute("style","border-radius:5px 4px 10px 10px;")
           }
         }
        }
      }

      /*if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-left" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-left"){
        show_messages.children.item((longtMessages-1)).children.item(0).children.item(1).setAttribute("style","background:blue; border-radius:5px 4px 10px 10px; ")
      }else if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-right" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-right"){
        show_messages.children.item((longtMessages-1)).children.item(0).children.item(0).setAttribute("style","background:blue; border-radius:5px 4px 10px 10px;")
      }*/
      
      //console.log("msm:"+longtMessages+" i: "+i);
    }
    
    
  }
 
}
