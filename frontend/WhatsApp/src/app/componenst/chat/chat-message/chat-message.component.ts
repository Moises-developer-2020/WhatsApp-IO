import { Component, OnInit } from '@angular/core';
import { ChatService } from "../../../services/chat/chat.service";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import { UserSelected } from "../../../models/userSelected";

import * as CryptoJS from "crypto-js";
import { DomSanitizer } from '@angular/platform-browser';
import { NEVER } from 'rxjs';
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
      email:""
    },
     messages:{
       data:[]
     }
   },
   myId:""
  };

  Message;
  constructor(private chatService:ChatService,
    private webSocketService:WebSocketService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

    this.webSocketService.listen('reponse-user-selected')
    .subscribe(res=>{
      this.UserSelectedResponse=res as UserSelected;
      //console.log(this.UserSelectedResponse);

      setTimeout(() => {
        this.styleMessages();
      }, 10);
    });
    
    this.webSocketService.listen('response-msm-sent')
    .subscribe(res=>{
      console.log(res);
      
    })
    
  }
  sendMessage(msm:HTMLDivElement){
    var NewMessage={
      MyId:this.UserSelectedResponse.myId,
      receiver:this.UserSelectedResponse.msm.user._id,
     // msm:CryptoJS.AES.encrypt(this.Message,this.KeyCryptoJS).toString(),
      msm:this.Message,
      createAt:new Date()
    }
    //send the msm to socket
    this.webSocketService.emit('send-message',NewMessage);

    //paint the message send  
    var message={
        message:{
          file:{
            docs: [],
            image: []
          },
          messages:{
            created_at: NewMessage.createAt,
            msm: NewMessage.msm
          },
          _id_user_emisor: NewMessage.MyId,
          _id_user_receptor: NewMessage.receiver
        }
    }
    //console.log(message);
    this.UserSelectedResponse.msm.messages.data.push(message);

    console.log(this.UserSelectedResponse);

    this.Message='';
    msm.scrollTop=msm.scrollHeight;
    
    setTimeout(() => {
     this.styleMessages();
    }, 10);
   
    
  }

  styleMessages(){
    //this.UserSelectedResponse.msm.messages.data.length
    /*for(var i=0; i<1;i++){
      
      //console.log(this.UserSelectedResponse.msm.messages.data[i]['message']['messages']['msm']);
      console.log(this.UserSelectedResponse);
      
    }*/
    var show_messages=document.querySelector('.show-messages');
    show_messages.scrollTop=show_messages.scrollHeight;
    //console.log(show_messages.children.length)
    //style for the messages
    var longtMessages=show_messages.children.length;
    for(var i=0; i<show_messages.children.length;i++){
        if(show_messages.children.item(i).children.item(0).className=="show-messages-right"){
          if(show_messages.children.item((i+1))){
              if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-right"){
                      
                show_messages.children.item((i+1)).children.item(0).setAttribute("style","background:#ff000033; margin-top: -14px;"); //delete padding 'div center'
                show_messages.children.item((i+1)).children.item(0).children.item(0).setAttribute("style","border-radius:5px 2px 2px 5px;"); //delete div:children border-radius 'div center'
    
                if(show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0) && show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0).className=="toggle-right"){
                  show_messages.children.item((i+1)).children.item(0).children.item(0).children.item(0).remove(); //delete toggle-right
                }
    
                if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0)){
                  if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0).className=="toggle-right"){
                    show_messages.children.item((i)).children.item(0).children.item(0).setAttribute("style","background:blue; border-radius:10px 0 4px 5px;"); //delete border-radius 'first div'
                    
                  } 
                } 
    
                
              }else{
                  
                
                if(show_messages.children.item((i-1)).children.item(0).className=="show-messages-right"){
                  show_messages.children.item((i)).children.item(0).children.item(0).setAttribute("style","background:#7d7d7d; border-radius:5px 4px 10px 10px;"); //add border-radius 'last div'
                }
                // show_messages.children.item((i+1)).children.item(0).setAttribute("style","background:green;"); //delete padding
              }
            }
          
        }
      

      if(show_messages.children.item(i).children.item(0).className=="show-messages-left"){
        if(show_messages.children.item((i+1))){
          if(show_messages.children.item((i+1)).children.item(0).className=="show-messages-left"){
                    
            show_messages.children.item((i+1)).children.item(0).children.item(1).setAttribute("style","background:purple;border-radius:4px 5px 5px 4px; margin: 0 29px;"); //delete div:children border-radius 'div center'
           
            if(show_messages.children.item((i)).children.item(0).children.item(0).children.item(0)){//are for validate if exist
              show_messages.children.item((i)).children.item(0).children.item(0).children.item(0).remove(); //delete img receptor
            }
            if(show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0) && show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0).className=="toggle-left"){
              show_messages.children.item((i+1)).children.item(0).children.item(1).children.item(0).remove(); //delete toggle
            }

           if(show_messages.children.item((i)).children.item(0).children.item(1).children.item(0)){
              if(show_messages.children.item((i)).children.item(0).children.item(1).children.item(0).className=="toggle-left"){
                show_messages.children.item((i)).children.item(0).children.item(1).setAttribute("style","background:orange; border-radius:5px 10px 4px 4px;  margin: 0 29px;"); //delete border-radius 'first div'
                
              } 
           }

            
          }else{
                            
            if(show_messages.children.item((i-1)).children.item(0).className=="show-messages-left"){
              show_messages.children.item((i)).children.item(0).children.item(1).setAttribute("style","background:#7d7d7d; border-radius:5px 4px 10px 10px;  "); //add border-radius 'last div'
            }

          }
        }
      }

      //style the last div 
      if(show_messages.children.item((longtMessages-1)).children.item(0)){
        if(show_messages.children.item((longtMessages-2)).children.item(0)){
          if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-left" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-left"){
            show_messages.children.item((longtMessages-1)).children.item(0).children.item(1).setAttribute("style","background:blue; border-radius:5px 4px 10px 10px; ")
          }
        }
      }
      if(show_messages.children.item((longtMessages-1)).children.item(0)){
        if(show_messages.children.item((longtMessages-2)).children.item(0)){
           if(show_messages.children.item((longtMessages-1)).children.item(0).className=="show-messages-right" && show_messages.children.item((longtMessages-2)).children.item(0).className=="show-messages-right"){
            show_messages.children.item((longtMessages-1)).children.item(0).children.item(0).setAttribute("style","background:blue; border-radius:5px 4px 10px 10px;")
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
