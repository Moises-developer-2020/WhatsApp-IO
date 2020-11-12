import { Component, OnInit } from '@angular/core';
import { ChatService } from "../../../services/chat/chat.service";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import { UserSelected } from "../../../models/userSelected";

import * as CryptoJS from "crypto-js";
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
     _id:"",
     name:"",
     email:"",
     messages:[]
   },
   myId:""
  };

  Message;
  constructor(private chatService:ChatService,
    private webSocketService:WebSocketService) { }

  ngOnInit(): void {
    this.webSocketService.listen('reponse-user-selected')
    .subscribe(res=>{
      this.UserSelectedResponse=res as UserSelected
      console.log(this.UserSelectedResponse);
    });
    
    this.webSocketService.listen('response-msm-sent')
    .subscribe(res=>{
      console.log(res);
      
    })
    
  }

  sendMessage(){
    var message={
      MyId:this.UserSelectedResponse.myId,
      receiver:this.UserSelectedResponse.msm._id,
     // msm:CryptoJS.AES.encrypt(this.Message,this.KeyCryptoJS).toString(),
      msm:this.Message,
      createAt:new Date()
    }
    
    this.webSocketService.emit('send-message',message);
    this.Message='';
    
  }

}
