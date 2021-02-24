import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from "../../../services/login/auth-service.service";
import { ChatService } from "../../../services/chat/chat.service";
import { UserSelected } from "../../../models/UserSelected";

@Component({
  selector: 'app-chat-nav-right',
  templateUrl: './chat-nav-right.component.html',
  styleUrls: ['./chat-nav-right.component.css']
})
export class ChatNavRightComponent implements OnInit {
  UserSelected:UserSelected={
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
  constructor(private AuthService:AuthServiceService,
    private ChatService:ChatService) { 
    
  }

  ngOnInit(): void {
    if(this.AuthService.refreshToken()){
      this.ChatService.userSelected
      .subscribe(resp=>{
        this.UserSelected=resp as UserSelected;
        console.log(this.UserSelected);
        
        
      });
    }
    
  }

}
