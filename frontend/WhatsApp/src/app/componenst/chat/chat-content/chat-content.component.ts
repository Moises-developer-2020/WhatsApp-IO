import { Component, OnInit, ViewChild} from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";
import { User } from "../../../models/user";

import { AlertComponent } from "../../static/alert/alert.component";
import {WebSocketService  } from "../../../services/SocketIO/Web-Socket.service";
import { ChatNavLeftComponent } from "../chat-nav-left/chat-nav-left.component";
import * as CryptoJS from "crypto-js";

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html',
  styleUrls: ['./chat-content.component.css']
})
export class ChatContentComponent implements OnInit {

  userLogIn:User={};

  private readonly passUserEncrypJS="Message";

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
  @ViewChild(AlertComponent)
  WindowAlert:AlertComponent

  @ViewChild(ChatNavLeftComponent)
  ChatNavLeftComponent:ChatNavLeftComponent

  constructor(private chatService:ChatService, private authService:AuthServiceService, private webSocketService:WebSocketService) {
    this.MyData();
  }

  ngOnInit(): void {
   // history.replaceState('moises',location.pathname,'/chat/4/5');
    //**********************  SCRIPT DE CONFIGURACION ADAPTACION A DISPOSITIVO  **************************////

    //console.log( document.getElementById('j').attributes);
    //console.log( document.body.children[0].children[1].children.namedItem('j').attributes);
    
    //para adaptar los div a la ventana del dispositivo
    //**********************************
    //if(location.pathname.indexOf('/chat') != -1){
    
      var chatMain =document.querySelector('.chat-main');
      var chatContent =document.querySelector('.chat-content');
      var Allcontent =document.querySelector('.All-content');
      var AllcontentID =document.getElementById('All-content-id');
      
      function Allcontent_Adaptable(){//adapto .All-content con el tamno del .chat-nav-top 
        //console.log(chatContent.children);
        var totalHeightWindow=chatMain.clientHeight-chatContent.children.item(0).clientHeight;
      // console.log(totalHeightWindow);
        
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

      //this belongs to chat-nav-left
      function searchAdaptable(){
        var search_User_content=document.querySelector('.search-User-content');
        var search_User_nav=document.querySelector('.search-User-nav');
        var totalHeight=search_User_content.clientHeight - search_User_nav.clientHeight;
        //console.log("t "+search_User_nav.clientHeight);
        
        document.querySelector('.search-User-person').setAttribute("style","height:"+totalHeight+"px");
      }
      /*-------------------------------------*/
      document.getElementById('openSearch').onclick=()=>{
        searchAdaptable();
      }
      //para que se ejecuten al darse el evento
      window.onresize=function(){
        windowAdaptable();
        Allcontent_Adaptable();
        contentMessageUsersAdaptable();
        showMessagesAdapter();
        searchAdaptable();

      };
      window.onload=function(){
        windowAdaptable();
        Allcontent_Adaptable();
        contentMessageUsersAdaptable();
        showMessagesAdapter();
        searchAdaptable();
        
      }
      AllcontentID.onscroll=function(){
        windowAdaptable();
        Allcontent_Adaptable();
        contentMessageUsersAdaptable();
        showMessagesAdapter();
        searchAdaptable();
        
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
      //********************  fin scrypt de adaptacion al dispositivo  ******************

    //}      

    
  }
  MyData(){
    if(this.authService.refreshToken()){
      this.chatService.MyData()
      .subscribe(
        res=>{
          this.userLogIn=res.sendUser as User;
          this.WindowAlert.AlertInfo({status:false});
          //history.replaceState('moises',location.pathname,'/chat/'+res.sendUser.name);
          this.webSocketService.connect();//conected in case i disconnected
          this.webSocketService.emit('userConeccted',this.userLogIn);//envio el id del usuario conectado al socket

          this.ChatNavLeftComponent.MyID=this.userLogIn._id;//send myId a chat-nav-left.component
          //to the reload
            if(localStorage.getItem('USL')){
              var getUserSavedStorage=localStorage.getItem('USL');
              getUserSavedStorage=CryptoJS.AES.decrypt(getUserSavedStorage,this.passUserEncrypJS).toString(CryptoJS.enc.Utf8);
              getUserSavedStorage=JSON.parse(getUserSavedStorage);
             //console.log(getUserSavedStorage);
              //send request to the socket for get the messages
              this.ChatNavLeftComponent.UserSelected(getUserSavedStorage); 

            }
        }, 
        err=>{
          //muestro una alerta y redirijo a signIn
          this.WindowAlert.AlertInfo({
            status:true,
            error:true,
            message:err.error.msm
          })
         
        }//add an alert to send me to login as teams 
      )
      
    }else{
      setTimeout(() => {//no lo carga al iniciar por eso despues de 1s
        this.WindowAlert.AlertInfo({
          status:true,
          error:true,
          message:"Session Expirada"
        });
      }, 1000);
    };
  }

  
  logOut(){//cerrar session
    this.authService.logout();
  }

  //para manejar la vista de las ventans en tama;o celular
  OpenCloseWindows({
    chatNavLeft=false,
    chatNavLeftSearchUsers=false,
    chatNavRight=false,
    chatMessage=false
  }){
    const chat_nav_left= document.querySelector('.chat-nav-left');
    const chat_content_message= document.querySelector('.chat-content-message');
    const nav_right_message= document.querySelector('.nav-right-message');
    
    chatNavLeft?chat_nav_left.classList.add('show'):chat_nav_left.classList.remove('show');
    chatNavRight?nav_right_message.classList.add('show'):nav_right_message.classList.remove('show');
    chatMessage?chat_content_message.classList.add('show'):chat_content_message.classList.remove('show');
    
    this.ngOnInit();//para que se ejecute la adaptacion
  }
}
