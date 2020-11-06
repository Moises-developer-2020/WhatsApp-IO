import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import * as io from "socket.io-client";
import { Observable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

    socket:any;

    private readonly Server="http://localhost:3000";

    constructor(private http:HttpClient) {
        this.socket=io(this.Server);
    }

    //for listen messages
    listen(eventName:String){
        return new Observable((Subscriber)=>{
            this.socket.on(eventName,(data)=>{
                Subscriber.next(data);
            });
        });
    };

    //emit messages
    emit(eventName:String, data:any){
        this.socket.emit(eventName, data);
    };
}
