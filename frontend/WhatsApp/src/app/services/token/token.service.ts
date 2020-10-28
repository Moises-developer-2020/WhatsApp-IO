import { Injectable } from '@angular/core';

import { AuthServiceService } from "../login/auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private authServiceLogin:AuthServiceService) { }

  intercept(req, next){

    const tokenizeReq=req.clone({
      setHeaders:{
        Authorization: `Bearer ${this.authServiceLogin.getToken()}`
      }
    })
    return next.handle(tokenizeReq);

  }
}
