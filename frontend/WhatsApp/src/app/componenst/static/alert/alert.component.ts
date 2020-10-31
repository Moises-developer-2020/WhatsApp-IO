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
    message:""
  };
  constructor() { }

  ngOnInit(): void {
  }

}
