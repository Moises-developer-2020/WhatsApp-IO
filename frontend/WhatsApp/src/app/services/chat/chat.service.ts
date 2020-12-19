import { EventEmitter, Injectable, Output } from '@angular/core';

import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //userSelected={};//(response SocketIO) user selected in search or myContacts

  private readonly URL_API="http://localhost:3000/api";

  @Output() Contacts:EventEmitter<any>= new EventEmitter();//send my contacts updated

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
  UpdateContacts(newContact){    
    this.Contacts.emit(newContact);
  }
}
