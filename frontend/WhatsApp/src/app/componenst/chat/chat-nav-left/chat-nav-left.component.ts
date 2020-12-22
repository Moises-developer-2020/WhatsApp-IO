import { Component, OnInit,ViewChild } from '@angular/core';

import { ChatService } from "../../../services/chat/chat.service";
import { AuthServiceService } from "../../../services/login/auth-service.service";

import {AlertComponent} from "../../static/alert/alert.component";
import { WebSocketService } from "../../../services/SocketIO/Web-Socket.service";
import * as CryptoJS from "crypto-js";

import {myContact } from "../../../models/myContact";
import {MyContactsActive } from "../../../models/myContactsActive";

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
        message:[],
        stateActive:false,
        time:null,
        disconnection:null,
        stopDisconnection:null,
        LastTimeActive:0
      }
    ]  
  };
  contactsActive={
    users:[]
  };
  userSelected:any;
  constructor(
    private chatService:ChatService,
    private authService:AuthServiceService,
    private webSocketService:WebSocketService) { }

  ngOnInit(): void {
    /*this.chatService.Contacts.subscribe(resp=>{
      console.log(resp);
      this.contactsActive=resp;
    })*/
    
    if(this.authService.refreshToken()){
      this.webSocketService.listen('my-contact')
      .subscribe(res=>{
        console.log('my-contact');
        

        this.MyContacts=res as myContact;
        var userss=JSON.stringify(this.MyContacts.contacts);
        this.contactsActive.users=JSON.parse(userss);

        //add typemessage 
        this.MyContacts.contacts.forEach(element=>{
          element.message.typeMessage=false;
          element.stateActive=false;         
          element.LastTimeActive=0;         
          element.time=null;         
        });
        

        //order message by date send
        this.MyContacts.contacts.sort(function(a, b){
          if(a.message.created_at>b.message.created_at) return -1;
          if(b.message.created_at<b.message.created_at) return 1;
          return 0;
        });
        this.contactsActive.users.sort(function(a, b){
          if(a.message.created_at>b.message.created_at) return -1;
          if(b.message.created_at<b.message.created_at) return 1;
          return 0;
        });
        
        //console.log(this.MyContacts);
        
      });
      /*********************** */
      this.webSocketService.listen('resp-type-message')//resp from type-message
      .subscribe(res=>{
        console.log('resp-type-message');
        
        /*console.log(res);
        console.log(this.MyContacts);*/
       // console.log(this.MyContacts);

        var contact=this.MyContacts.contacts;
        var index=contact.findIndex(function(elem){
          return elem._id_user === res.user;
        });

        if(index != -1){
          if(res.state){
            contact[index].message.typeMessage=true;//you writing
          }else{
            contact[index].message.typeMessage=false;//you not write
          }
        } 
      

      });
      /************************* */
      this.webSocketService.listen('response-msm-sent')//reponse menssage send
      .subscribe(res=>{
        console.log('response-msm-sent');
        
       // console.log(res);
        
        //console.log(res.contact);
        if(res.contact._id_user == this.MyID){//i send the message
          //modify the content to the message send for me.
          res.contact._id_user=this.userSelected.id;
          res.contact.name=this.userSelected.name;
          res.contact.message.send="Tú: ";
          
        }
        //remove mi contact if exist and add to the new message updated
        if(this.MyContacts.contacts.length > 0){
          var index=this.MyContacts.contacts.findIndex(function(element){
            return element._id_user === res.contact._id_user;
          });          
          if(index != -1){          
            res.contact.stateActive=this.MyContacts.contacts[index].stateActive?true:false;//mantener el estado activo del usuario
            
            this.MyContacts.contacts.splice(index,1);
          }
        }
        
        var index_user=this.contactsActive.users.findIndex(function(element){
          return element._id_user === res.contact._id_user;
        });          
        if(index_user != -1){          
          res.contact.stateActive=this.contactsActive.users[index_user].stateActive?true:false;//mantener el estado activo del usuario
          
          this.contactsActive.users.splice(index_user,1);
        }

       
        this.MyContacts.contacts.push(res.contact);
        this.contactsActive.users.push(res.contact);
        /*console.log(this.MyContacts.contacts.length);
        console.log(this.MyContacts);*/
        

        //add typemessage if not exit it
        this.MyContacts.contacts.forEach(element=>{
          if(!element.message.typeMessage){
            element.message.typeMessage=false;
          }
        });

        //order contacts by date send
        this.MyContacts.contacts.sort(function(a, b){
          if(a.message.created_at>b.message.created_at) return -1;
          if(b.message.created_at<b.message.created_at) return 1;
          return 0;
        });
        //console.log(this.MyContacts);
        /*************************
         si quiero que me actualize el orden de los 
         contactos activos cuando recivo la respuesta del mensaje enviado debo hacer
         1- eliminar el json del usuario que me envio el mensaje
         2- agregar push() nuevo json con el usuario que me envio el mensaje
         3- ejecutar la sentencia de abajo 'this.contactsActive.users.sort'
         * *************************  */
        this.contactsActive.users.sort(function(a, b){
          //order for state active and date of message sends
          if(a.stateActive && a.message.created_at>b.message.created_at) return -1;
          if(!a.stateActive && a.message.created_at<b.message.created_at) return 1;
          if(!b.stateActive ) return -1;
          return 0;
        });
        
      });

      //message view
      this.webSocketService.listen('response-state-message-views')
      .subscribe(res=>{
        let ID;
        if(res.emisor == this.MyID){
          ID=res.receptor;
          
        }else{
          ID=res.emisor;
        }
        let indexReceive=this.MyContacts.contacts.findIndex(function(elemt){
          return elemt._id_user === ID;
        });
        console.log(indexReceive);
        
        if(indexReceive != -1){
          //if(res.connected){
            if(res.state || res.receptor== this.MyID){
            this.MyContacts.contacts[indexReceive].message.read=true;
            this.MyContacts.contacts[indexReceive].message.image="assets/public/icon/sonreir.svg";
          };
         // if(res.receptor == this.MyID || !res.connected ){
          if( res.state || !res.connected || res.receptor!= this.MyID ){
            //if(ID != this.MyID && res.state || !res.connected  ){
            this.MyContacts.contacts[indexReceive].message.cantMessageReceive=0;
            console.log('receive 0');
            
          }
        }
        console.log('response-state-message-views');
        console.log(res);
        
      });
      //response state-active
      this.webSocketService.listen('state-active')
      .subscribe(res=>{
        //console.log(res);
        
        var state=JSON.stringify(res);
        var stateActive=JSON.parse(state);
        console.error(stateActive);
        
        //console.error(stateActive[0]._id_user);

        for(var i=0; i<stateActive.length; i++){
          var ID="";
            if(stateActive[i]._id_receive == this.MyID){
              ID=stateActive[i]._id_emit;
            }else{
              ID=stateActive[i]._id_receive;
            }
          var index=this.MyContacts.contacts.findIndex(function(contact){
            return contact._id_user === ID;
          });
          if(index != -1){
           // console.log('index: '+index);

            this.MyContacts.contacts[index].stateActive=stateActive[i].state;//boolean

            if(!stateActive[i].state){
              var time_disconnected=0;
              if(stateActive[i].time != null){
                //console.error(stateActive[i].time);
                time_disconnected= this.Date_Disconnection(stateActive[i].time).dateFormat.minutes;
                
              }
              this.MyContacts.contacts[index].disconnection=function(){
                this.LastTimeActive=time_disconnected;
                this.time=setInterval(() => {
                  this.LastTimeActive+=1;
                }, 60000);//every minute disconected 
              };
              this.MyContacts.contacts[index].disconnection();
              
            }else{
              if(this.MyContacts.contacts[index].time != null){
                this.MyContacts.contacts[index].stopDisconnection=function(){
                  clearInterval(this.time);
                  this.LastTimeActive=0;
                };
                this.MyContacts.contacts[index].stopDisconnection();
              };
              
            }
          }
          //change el index from .sort in contactsActive
          //for contactsActive 
          var ind=this.contactsActive.users.findIndex(function(contact){
            return contact._id_user === ID;
          });
          if(ind != -1){
            console.log('index: '+ind);
            this.contactsActive.users[ind].stateActive=stateActive[i].state;
          }
        }
        /*console.log(this.contactsActive);
        console.log(this.MyContacts);*/
        //order for state active, first users active
        this.contactsActive.users.sort(function(a, b){
          //order for state active and date of message sends
          if(a.stateActive && a.message.created_at>b.message.created_at) return -1;
          if(!a.stateActive && a.message.created_at<b.message.created_at) return 1;
          if(!b.stateActive ) return -1;
          return 0;
        });
        
        
      });
    };    
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
    this.userSelected=data;
    this.webSocketService.emit('user-selected',data);
    console.log('user-seleted');
    
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

  imageReceive(send:any){
   // console.log(send);
    
    if(send == ''){
      return false;
    }else{
      return true;
    }   
  }
  DateformatContacts(dateSave){
    if(dateSave){
      function dateInHours(){
        // Set the date we're counting down to
        var getDateSave = new Date(dateSave).getTime();

        // Get todays date and time
        var now = new Date().getTime();
        
        // Find the distance between now an the count down date
        var distance = now-getDateSave;
        
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        return JSON.parse(`{
          "dateFormat":{
            "days":${days},
            "hours":${hours},
            "minutes":${minutes},
            "seconds":${seconds}
        }}`);
      };

      var date=new Date(dateSave);    
      let timestampSave=date.toLocaleTimeString('en-US');

      /*console.log(dateInHours());
      console.log(timestampSave);
      
      console.log(dateInHours().dateFormat.days);*/
      
      if(dateInHours().dateFormat.days == 0){
        var formatHour=timestampSave.split(':');
        //without seconds
        var hour=formatHour[0]+':'+formatHour[1]+' '+formatHour[2].split(' ')[1];
        //return hours
        return hour;
      }else {
        var days=date.toDateString().split(' ')[0];
        var monts=date.toDateString().split(' ')[1];
        var days_number=date.toDateString().split(' ')[2];
        var year=date.toDateString().split(' ')[3];
        
        //var dateSaveFormat=days+' '+monts+' '+days_number+' '+year;
        var dateSaveFormat=monts+' '+days_number+' '+year;
        return dateSaveFormat;
      }
      
    }
  }
  Date_Disconnection(dateSave){//elapse time //tiempo transcurrido
    // Set the date we're counting down to
    var getDateSave = new Date(dateSave).getTime();

    // Get todays date and time
    var now = new Date().getTime();
    
    // Find the distance between now an the count down date
    var distance = now-getDateSave;
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    return JSON.parse(`{
      "dateFormat":{
        "days":${days},
        "hours":${hours},
        "minutes":${minutes},
        "seconds":${seconds}
    }}`);
  };
}
