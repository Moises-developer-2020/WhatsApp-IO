import { Component, OnInit,ViewChild } from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";

import {AlertComponent} from "../../static/alert/alert.component";

@Component({
  selector: 'app-chat-nav-left',
  templateUrl: './chat-nav-left.component.html',
  styleUrls: ['./chat-nav-left.component.css']
})
export class ChatNavLeftComponent implements OnInit {

  @ViewChild(AlertComponent)
  WindowAlert:AlertComponent

  //All users in the section Search
  AllUserSearch=[{
    _id:"",
    name
  }]

  constructor(private chatService:ChatService, private authService:AuthServiceService) { }

  ngOnInit(): void {
    
  }

  openSearch(key, type:boolean){
    type?key.classList.add('show'):key.classList.remove('show');

    if(type){
      if(this.authService.refreshToken()){   
        this.chatService.getAllUsersInSearch()
        .subscribe(
            res=>{
            this.AllUserSearch=res.users
  
            },error=>{
            //console.log(error);
            this.WindowAlert.AlertInfo({
              status:true,
              error:true,
              message:"Error al optener usuarios"
            });
            }
        );
  
      }else{
        this.WindowAlert.AlertInfo({
          status:true,
          error:true,
          message:"Expired Session"
          });
      }
    }
  }

  SearchUsers(name){
    
    if(this.authService.refreshToken() ){
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

  UserSelected(id){
    console.log(id);
    
  }
}
