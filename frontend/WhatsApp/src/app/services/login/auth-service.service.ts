import { Injectable } from '@angular/core';

//service
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";



@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  signIn_Email:String;//esto es si el registro fue exitoso lleno el input del sigIn

  private readonly URL_API="http://localhost:3000/api";
  constructor(private http:HttpClient, private router:Router) { 
    
  }

  //resgister user
  signUp(user){
    return this.http.post<any>(this.URL_API+'/signUp',user);
  }

  //login user
  signIn(user){
    return this.http.post<any>(this.URL_API+'/signIn',user);
  }


  //para comprobar si el usuario esta logueado con auth.guard
  //con el token
  loggedIn():boolean{
    //esto devolvera un tru o false si el token existe
    return !!localStorage.getItem('token');

    //es como decir esto 
    /*
    if(localStorage.getItem('token')){
      return true
    }
     */
  }


  //optener el token y usarlo en servico de token
  getToken(){
    return localStorage.getItem('token');
  }

  //para eliminar el token
  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/login/signIn']);
  }

  //para refrescar el token con la nueva fecha de expiracion
  refreshToken(){
    //conprueba si no ha expirado. tambien esta en el servidor la validacion
    let DateReceived = localStorage.getItem("token").split(' ')[1];
    
    
    
    let DateDesencrypt=new Date(atob(DateReceived));
    let timeDesencrypt=DateDesencrypt.toLocaleTimeString('en-US');

    let dateNow=new Date();
    let timestampNow=dateNow.toLocaleTimeString('en-US');


    
    function difference_between_dates(date__now, last_date){
        var hours1 = (date__now.substring(0,date__now.indexOf(" "))).split(":"),
        hours2 = (last_date.substring(0,last_date.indexOf(" "))).split(":"),
        t1 = new Date(),
        t2 = new Date();

        t1.setHours(hours1[0], hours1[1], hours1[2]);
        t2.setHours(hours2[0], hours2[1], hours2[2]); 
        
        //Aquí hago la resta
        t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
        

        return JSON.parse(`
        {"date":{
            "hours":${t1.getHours()},
            "minutes":${t1.getMinutes()},
            "seconds":${t1.getSeconds()}
        }}
        `);
    }

    var elapseTime=difference_between_dates(timestampNow, timeDesencrypt);
    console.log(elapseTime);
    if(elapseTime.date.hours>0 || elapseTime.date.minutes>=15){
      //console.log("session ha expirado");
     setTimeout(() => { //3 segundos de retardo para mostrar la alerta de session expirada
      this.logout();
     }, 3000);
      return false;
    }else{
      
      //estraigo el token y le agrego la nueva fecha de expiracion
      var newTokenDate= localStorage.getItem("token").split(' ')[0] +" "+btoa(Date());
      localStorage.setItem('token',newTokenDate);
      return true;
    };
 
  }
}
