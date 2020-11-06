import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly URL_API="http://localhost:3000/api";

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
}
