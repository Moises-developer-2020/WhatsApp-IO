import { Component, OnInit,ViewChild } from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";

import {AlertComponent} from "../../static/alert/alert.component";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import * as CryptoJS from "crypto-js";

import {myContact } from "../../../models/myContact";

@Component({
  selector: 'app-chat-nav-left',
  templateUrl: './chat-nav-left.component.html',
  styleUrls: ['./chat-nav-left.component.css']
})
export class ChatNavLeftComponent implements OnInit {

  @ViewChild(AlertComponent)
  WindowAlert:AlertComponent

  private readonly passUserEncrypJS="Message";

  //All users in the section Search
  AllUserSearch=[{
    _id:"",
    name
  }];

  MyID;//my id receive from 'chatService.getAllUsersInSearch()'

  MyContacts:myContact={
    contacts:[
   {
      _id_user:"",
      name:"",
      message:[]
    }
  ]
    
}
  constructor(
    private chatService:ChatService,
    private authService:AuthServiceService,
    private webSocketService:WebSocketService) { }

  ngOnInit(): void {
    if(this.authService.refreshToken()){
      this.webSocketService.listen('my-contact')
      .subscribe(res=>{
        this.MyContacts=res as myContact;
        console.log(this.MyContacts);
        
      })
    }
  }
  
  openSearch(key, type:boolean){ //show hidden div the search-User-content
    type?key.classList.add('show'):key.classList.remove('show');

    if(type){
      if(this.authService.refreshToken()){   
        this.chatService.getAllUsersInSearch()
        .subscribe(
            res=>{
            this.AllUserSearch=res.users;
            this.MyID=res.MyID;
            
              
            },error=>{
            //console.log(error);
            this.WindowAlert.AlertInfo({
              status:true,
              error:true,
              message:"Error getting users"
            });
            }
        );
  
      }else{
        this.WindowAlert.AlertInfo({
          status:true,
          error:true,
          message:"Session has expired"
          });
      }
    }
  }

  SearchUsers(name){
    
    if(this.authService.refreshToken()){
      this.chatService.SearchUsers(name.target.value)
      .subscribe(
        res=>{
          this.AllUserSearch=res.users;
        },error=>{          
          this.WindowAlert.AlertInfo({
            status:true,
            error:true,
            message:"Error al buscar el usuario"
          });
        });
    }
  };

  UserSelected(user:any){

    var data={
      MyID:this.MyID || user.MyID, // || user.MyID to 'userSavedStorage'
      id:user.id,//of the selected user
      name:user.name
    }
    this.webSocketService.emit('user-selected',data);
    //history.pushState('','','/chat/'+user.name+'/'+user.id);
    history.pushState('','','/chat/'+user.name);

    //for if reload
    var userSavedStorage=JSON.stringify(data);
    //USL =USER SAVED SELECTED
    if(localStorage.getItem('USL')){
      localStorage.removeItem('USL');
    }
    localStorage.setItem('USL',CryptoJS.AES.encrypt(userSavedStorage,this.passUserEncrypJS).toString());

    //close the user search window
    var search_User_content=document.querySelector('.search-User-content');
    search_User_content.className.includes("show")?search_User_content.classList.remove('show'):"";

  }

  decryptMessages(message){
    try {
      return CryptoJS.AES.decrypt(message,this.passUserEncrypJS).toString(CryptoJS.enc.Utf8)  
    } catch (error) {
      return message;
    }
    
  }
  
}
