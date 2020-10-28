import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Router } from "@angular/router";
import { AuthServiceService } from "../app/services/login/auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router:Router, private authLogin:AuthServiceService){}
  
  canActivate():boolean{
    if(this.authLogin.loggedIn()){
      return true;
    }
    //else
    this.router.navigate(['/login/signIn']);
    return false;
  }
  
}
