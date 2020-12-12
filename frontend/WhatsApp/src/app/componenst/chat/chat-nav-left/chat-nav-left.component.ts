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
  };
  userSelected:any;
  constructor(
    private chatService:ChatService,
    private authService:AuthServiceService,
    private webSocketService:WebSocketService) { }

  ngOnInit(): void {
    this.chatService.Contacts.subscribe(resp=>{
      console.log(resp);
    })
    if(this.authService.refreshToken()){
      this.webSocketService.listen('my-contact')
      .subscribe(res=>{
        console.log('my-contact');
        
        this.MyContacts=res as myContact;

        //add typemessage 
        this.MyContacts.contacts.forEach(element=>{
          element.message.typeMessage=false;
        });

        //order message by date send
        this.MyContacts.contacts.sort(function(a, b){
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
            this.MyContacts.contacts.splice(index,1);
          }
        }

        
        this.MyContacts.contacts.push(res.contact);
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
        console.log(this.MyContacts);
        
        
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
        
      })
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
}
