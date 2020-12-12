import { Injectable } from '@angular/core';
import * as io from "socket.io-client";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

    socket:any;

    private readonly Server="http://localhost:3000";

    constructor() {
        /*this.socket=io(this.Server,{
            'reconnection': true,
            'reconnectionDelay': 10000,
            'reconnectionDelayMax' : 50000,
            'reconnectionAttempts': 5
     });*/
     this.socket=io(this.Server);
    }

    //for listen messages
    listen(eventName:String){
        return new Observable<any>((Subscriber)=>{
            this.socket.on(eventName,(data)=>{
                Subscriber.next(data);
            });
        });
    };

    //emit messages
    emit(eventName:String, data){
        this.socket.emit(eventName, data);
        
    };

    disconect(){//once disconnected it not longer sends request
        this.socket.disconnect();
    }
    connect(){
        this.socket.connect();
    }
    
}
