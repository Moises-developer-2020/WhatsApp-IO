import { Component, OnInit } from '@angular/core';

import { Alert } from "../../../models/alert";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {


  alertInfo={
    status:false,
    sucessfully:false,
    error:false,
    message:""
  };

  constructor() { }

  ngOnInit(): void {
  }
  // lo convierto en una funcion para hacer de los campos opcionales inicializandolos
  AlertInfo({status=false, successfully=false, error=false, message=""}) {
    this.alertInfo={
      status:status,
      sucessfully:successfully,
      error:error,
      message:message
    }
    
  }

}
