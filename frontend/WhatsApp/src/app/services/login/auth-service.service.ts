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
}
