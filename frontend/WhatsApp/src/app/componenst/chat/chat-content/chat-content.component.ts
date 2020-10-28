import { Component, OnInit } from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";
import { User } from "../../../models/user";


@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html',
  styleUrls: ['./chat-content.component.css']
})
export class ChatContentComponent implements OnInit {

  userLogIn:User={};

  /******************************* */


  //lo puedo haver solo con javascript con json u objeto, con css @media o solo con angular ngclass o ngIf ect mejor con css
//todo lo que esta aqui aparece en tama;o de celular
  showApp={
    moises:""
  }
  //todo lo que esta aqui desaparece en tama;o de lapto
  hiddenApp={

  }
  /**************** */


  constructor(private chatService:ChatService, private authService:AuthServiceService) {
    
          
  }

  ngOnInit(): void {
    this.chatService.exampleChat()
    .subscribe(
      res=>{
        this.userLogIn=res.sendUser as User;
       // console.log(res.sendUser.name);
        
      }
    )


    //**********************  SCRIPT DE CONFIGURACION ADAPTACION A DISPOSITIVO  **************************////

    //console.log( document.getElementById('j').attributes);
    //console.log( document.body.children[0].children[1].children.namedItem('j').attributes);
    
    //para adaptar los div a la ventana del dispositivo
    //**********************************

    var chatMain =document.querySelector('.chat-main');
    var chatContent =document.querySelector('.chat-content');
    var Allcontent =document.querySelector('.All-content');
    
    function Allcontent_Adaptable(){//adapto .All-content con el tamno del .chat-nav-top 
      //console.log(chatContent.children);
      var totalHeightWindow=chatMain.clientHeight-chatContent.children.item(0).clientHeight;
      console.log(totalHeightWindow);
      
      chatContent.children.item(1).setAttribute("style","height:"+totalHeightWindow+"px");
      
      
    } 
    
    // console.log(Allcontent.children)
    function windowAdaptable(){//hijos del #All-content
      for(var i=0; i<Allcontent.children.length; i++){
        //console.log(Allcontent.children.item(i));
        //adapto los hijos al tamano del padre
        Allcontent.children.item(i).setAttribute("style","height:"+Allcontent.clientHeight+"px");
      }
    }

    /*adaptar el .content-message-users al tama;o de su padre */

    var chatNavLeft=document.querySelector('.chat-nav-left');//div father

    var navLeft=document.querySelector('.nav-left');
    var activeUsers=document.querySelector('.active-users');
    var searchUsers=document.querySelector('.search-users');
    var contentMessageUsers=document.querySelector('.content-message-users');

    function contentMessageUsersAdaptable(){
      var ParcialHeight=navLeft.clientHeight + activeUsers.clientHeight + searchUsers.clientHeight;
      var totalHeight=chatNavLeft.clientHeight - ParcialHeight;
      contentMessageUsers.setAttribute("style","height:"+(totalHeight-22)+"px");
    }
    /*--------------- */

    /*Para adaptar .nav-message junto de sus hijos a la altura de .chat-content-message su padre */
    
    function showMessagesAdapter(){
      var chatContentMessage=document.querySelector('.chat-content-message');//padre
      //hijos
      var navMessage=document.querySelector('.nav-message');
      var showMessages=document.querySelector('.show-messages');//El que adaptare para que quede enmedio
      var sendOptions=document.querySelector('.send-options');

      var parcialTotal=chatContentMessage.clientHeight - navMessage.clientHeight - sendOptions.clientHeight;
      showMessages.setAttribute("style","height:"+(parcialTotal-4)+"px"); 
    }

    /*-------------------------------------*/

    //para que se ejecuten al darse el evento
    window.onresize=function(){
      windowAdaptable();
      Allcontent_Adaptable();
      contentMessageUsersAdaptable();
      showMessagesAdapter();
    };
    window.onload=function(){
      windowAdaptable();
      Allcontent_Adaptable();
      contentMessageUsersAdaptable();
      showMessagesAdapter();
    }
    /*document.getElementById('All-content-id').onclick=function(){
      windowAdaptable;
      Allcontent_Adaptable;
      contentMessageUsersAdaptable;
      console.log('e');
      
    } */
    
    
    //para que se ejecuten al iniciar esta pagina
    windowAdaptable;
    Allcontent_Adaptable();
    contentMessageUsersAdaptable();
    showMessagesAdapter();
    //*****************************************
    //********************  fin scryp de adaptacion al dispositivo  ******************

      
  }

  logOut(){
    this.authService.logout();
  }

}
