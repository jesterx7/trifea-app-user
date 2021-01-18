import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private http: HttpClient) { }

  onSignUpForm(data) {
  	const httpOptions: { headers; observe; } = {
  		headers: new HttpHeaders({
  			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  		}),
  		observe: 'response'
  	};

  	this.http.post('https://trifea.000webhostapp.com/api/sign_up_user', data, httpOptions).subscribe(
  	(resp) => {
  		if(resp['body']['status']) {
  			window.location.href = '/';
  		}
  	});
  }

  ngOnInit(): void {
  }

}
