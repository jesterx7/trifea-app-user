import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  history_list: any;

  constructor(private http:HttpClient) { }

  getCookie(name: string) {
  	let ca: Array<string> = document.cookie.split(';');
  	let caLen: number = ca.length;
  	let cookieName = `${name}=`;
  	let c: string;

  	for (let i: number = 0; i < caLen; i += 1) {
  		c = ca[i].replace(/^\s+/g, '');
  		if (c.indexOf(cookieName) == 0) {
  			return c.substring(cookieName.length, c.length);
  		}
  	}
  	return '';
  }

  getHistoryDataApi(url) {
  	url = url + "?user_id=" + this.getCookie('user_id');
  	this.http.get(url).toPromise().then(resp => {
  		if (resp['status']) {
  			this.history_list = resp['data'];
  		}
  	});
  }  

  ngOnInit(): void {
  	this.getHistoryDataApi("http://127.0.0.1:8000/api/get_user_request_status");
  }

}
