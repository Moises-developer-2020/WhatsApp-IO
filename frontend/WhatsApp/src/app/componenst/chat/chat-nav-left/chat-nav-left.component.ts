import { Component, OnInit,ViewChild } from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";

import {AlertComponent} from "../../static/alert/alert.component";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import * as CryptoJS from "crypto-js";

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

  MyID;//my id receive from getAllUsersInSearch()

  constructor(
    private chatService:ChatService,
    private authService:AuthServiceService,
    private webSocketService:WebSocketService) { }

  ngOnInit(): void {
    this.webSocketService.listen('messages-user-selected')
    .subscribe(res=>{
      console.log(res);
      
    });
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
      MyID:this.MyID, 
      id:user.id//of the selected user
    }
    this.webSocketService.emit('user-selected',data);
    history.pushState('','','/chat/'+user.name+'/'+user.id);
  }
  
}
