import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  error = false;
  error_message = '';

  constructor(private http:HttpClient) { }

  onLoginSubmit(data) {
  	const httpOptions: { headers; observe; } = {
  		headers: new HttpHeaders({
  			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  		}),
  		observe: 'response'
  	};

  	this.http.post('https://trifea.000webhostapp.com/api/login_user', data, httpOptions).subscribe(
  	(resp) => {
  		if(resp['body']['status']) {
  			window.location.href = '/bus';
        this.setCookie('user_id', resp['body']['user_id'], 1, 'USER_COOKIE');
  			this.setCookie('name', resp['body']['name'], 1, 'USER_COOKIE');
  			this.setCookie('email', resp['body']['email'], 1, 'USER_COOKIE');
        this.setCookie('address', resp['body']['address'], 1, 'USER_COOKIE');
        this.setCookie('phone_number', resp['body']['phone_number'], 1, 'USER_COOKIE');
  		}else{
        this.error = true;
        this.error_message = 'Wrong Username / Password';
      }
  	});
  }
  
  setCookie(name: string, value: string, expireDays: number, path: string = '') {
  	let d:Date = new Date();
  	d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
  	const expires = `expires=${d.toUTCString()}`;
  	const cpath = path ? `; path=${path}` : '';
  	document.cookie = `${name}=${value}; ${expires}${cpath}; SameSite=Lax`;
  }

  ngOnInit(): void {
  }
}
