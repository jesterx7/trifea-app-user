import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { timer } from 'rxjs';  

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})

export class UserHomeComponent implements OnInit {

  constructor(private http:HttpClient, private apiLoader: MapsAPILoader, private elRef: ElementRef) { }
  origin_lat = -7.977978;
  origin_lng = 112.636586;
  destination_lat = -7.977978;
  destination_lng = 112.636586;
  zoom = 10;
  
  error = false;
  error_message = '';

  track_id = 0;
  trip_id = 0;

  user_marker_url = "./assets/icons/user-marker.png";
  bus_marker_url = "./assets/icons/bus-marker.png";

  searchLocSuccess = false;
  search = false;
  tripVisible = false;

  driver_loc = [];
  type_list: any;
  track_list: any;
  schedule_list = [];
  trip_list = [];

  protected map: any;
  trackByIdentitiy = (index: number, item: any) => item;
  loc_timer = timer(500, 2000);

  updateBusLoc(driver_list) {
    let params = new HttpParams();
    params = params.append('driver_list', driver_list.join(','));

    const httpOptions: { headers; observe; } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }),
      observe: 'response'
    };

    this.http.post('http://127.0.0.1:8000/api/get_loc', params, httpOptions).subscribe(
    (resp) => {
      if(resp['body']['data']['status']) {
        this.driver_loc = resp['body']['data']['driver_loc'];
      }
    });
  }

  updateUserLoc() {
    let params = new HttpParams();
    params = params.append('user_id', this.getCookie('user_id'));
    params = params.append('loc_lat', this.origin_lat.toString());
    params = params.append('loc_lng', this.origin_lng.toString());

    const httpOptions: { headers; observe; } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }),
      observe: 'response'
    };

    this.http.post('http://127.0.0.1:8000/api/update_user_loc', params, httpOptions).subscribe(
    (resp) => {});
  }

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

  onRequestForm(data) {
    let params = new HttpParams();
    params = params.append('user_id', this.getCookie('user_id'));
    params = params.append('schedule_id', data.schedule);
    params = params.append('quantity', data.quantity);
    params = params.append('trip_id', this.trip_id.toString());

    const httpOptions: { headers; observe; } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }),
      observe: 'response'
    };

    this.http.post('http://127.0.0.1:8000/api/user_request', params, httpOptions).subscribe(
    (resp) => {
      if(resp['body']['status']) {
        alert(resp['body']['message']);
      } else {
        console.log('failed');
      }
    });
  }

  onTrackSelected(data) {
    this.track_id = data;
    this.getTripDataApi('http://127.0.0.1:8000/api/get_trip');
  }
  
  identify(index, item) {
    return item.name;
  }

  mapReady(map) {
  	this.map = map;
  }

  markerClicked() {
  	if (this.map) {
      this.getCurrentLocation();
      this.watchCurrentPosition();
  	}
  }

  setUserLocation() {
    var currentLatlng = new google.maps.LatLng(this.origin_lat, this.origin_lng);
    this.map.panTo(currentLatlng);
  }

  onSearchSubmit(data) {
  	const httpOptions: { headers; observe; } = {
  		headers: new HttpHeaders({
  			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  		}),
  		observe: 'response'
  	};

  	this.http.post('http://127.0.0.1:8000/api/get_driver_loc', data, httpOptions).subscribe(
  	(resp) => {
  		if(resp['body']['status'] && resp['body']['data']['driver_loc'].length) {
        this.markerClicked();
        this.driver_loc = resp['body']['data']['driver_loc'];
        this.trip_id = data['trip'];
        this.schedule_list = resp['body']['data']['schedule_list'];
        this.loc_timer.subscribe(val => this.updateBusLoc(resp['body']['data']['driver_list']));
  			this.search = true;
        this.searchLocSuccess = false;
  		} else {
        this.searchLocSuccess = true;
      }
  	});
  }

  getBusTypeApi(url) {
    this.http.get(url).toPromise().then(resp => {
      if (resp['status']) {
        this.type_list = resp['data'];
      }
    });
  }

  getTrackDataApi(url) {
    this.http.get(url).toPromise().then(resp => {
      if (resp['status']) {
        this.track_list = resp['data'];
        this.error = false;
      } else {
        this.error = true;
        this.error_message = 'Track Not Found';
      }
    });
  }

  getTripDataApi(url) {
    var params = '?track=' + this.track_id.toString();
    this.http.get(url+params).toPromise().then(resp => {
      if (resp['status']) {
        this.trip_list = resp['data'];
        this.tripVisible = true;
      }
    });
  }

  watchCurrentPosition() {
    navigator.geolocation.watchPosition(
      (position: any) => {
        this.origin_lat = position.coords.latitude;
        this.origin_lng = position.coords.longitude;
        this.setUserLocation();
        this.updateUserLoc();
      }
    );
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) => {
        if (position) {
          this.origin_lat = position.coords.latitude;
          this.origin_lng = position.coords.longitude;
        }
      });
    }
  }

  ngOnInit(): void {
    this.getTrackDataApi('http://127.0.0.1:8000/api/get_track_all');
    this.getBusTypeApi('http://127.0.0.1:8000/api/get_bus_type');
  }
}
