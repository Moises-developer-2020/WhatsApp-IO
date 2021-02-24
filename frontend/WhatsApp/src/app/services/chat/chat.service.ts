import { EventEmitter, Injectable, Output } from '@angular/core';

import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //userSelected={};//(response SocketIO) user selected in search or myContacts

  private readonly URL_API="http://localhost:3000/api";

  @Output() State_active:EventEmitter<any>= new EventEmitter();//send my contacts updated
  @Output() userSelected:EventEmitter<any>= new EventEmitter();//send user_selected to 'chat_nav_right'

  constructor(private http:HttpClient) { }

  MyData(){
    return this.http.get<any>(this.URL_API+'/chat');   
  }

  getAllUsersInSearch(){
    return this.http.get<any>(this.URL_API+'/searchUsers');
  }
  SearchUsers(name){
    return this.http.get<any>(this.URL_API+`/searchUsers/${name}`);
  }
  State_active_emit(state){    //use in chat_nav_left emit to chat_message
    this.State_active.emit(state);
  };
  User_Selected(user_selected){
    this.userSelected.emit(user_selected)
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
