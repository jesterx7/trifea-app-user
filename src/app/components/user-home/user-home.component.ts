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

  origin_city_id = 0;
  destination_city_id = 0;
  trip_id = 0;

  user_marker_url = "./assets/icons/user-marker.png";
  bus_marker_url = "./assets/icons/bus-marker.png";

  searchLocSuccess = false;
  search = false;
  tripVisible = false;

  driver_loc = [];
  city_list: any;
  type_list: any;
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

    this.http.post('https://trifea.000webhostapp.com/api/get_loc', params, httpOptions).subscribe(
    (resp) => {
      if(resp['body']['status']) {
        this.driver_loc = resp['body']['driver_loc'];
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

    this.http.post('https://trifea.000webhostapp.com/api/update_user_loc', params, httpOptions).subscribe(
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

  onOrderForm(data) {
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

    this.http.post('https://trifea.000webhostapp.com/api/user_order', params, httpOptions).subscribe(
    (resp) => {
      if(resp['body']['status']) {
        alert(resp['body']['msg']);
      } else {
        console.log('failed');
      }
    });
  }

  onOriginSelected(data) {
    this.origin_city_id = data;
  }

  onDestinationSelected(data) {
    this.destination_city_id = data;
    this.getTrackDataApi('https://trifea.000webhostapp.com/api/get_track');
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

  	this.http.post('https://trifea.000webhostapp.com/api/get_driver_loc', data, httpOptions).subscribe(
  	(resp) => {
  		if(resp['body']['status'] && resp['body']['driver_loc'].length) {
        this.markerClicked();
        this.driver_loc = resp['body']['driver_loc'];
        this.trip_id = data['trip'];
        this.schedule_list = resp['body']['schedule_list'];
        this.loc_timer.subscribe(val => this.updateBusLoc(resp['body']['driver_list']));
  			this.search = true;
        this.searchLocSuccess = false;
  		} else {
        this.searchLocSuccess = true;
      }
  	});
  }

  getCityDataApi(url) {
    this.http.get(url).toPromise().then(resp => {
      this.city_list = resp;
    });
  }

  getBusTypeApi(url) {
    this.http.get(url).toPromise().then(resp => {
      this.type_list = resp;
    });
  }

  getTrackDataApi(url) {
    var params = '?origin=' + this.origin_city_id.toString() + '&destination=' + this.destination_city_id.toString();
    this.http.get(url+params).toPromise().then(resp => {
      if (resp['status']) {
        this.getTripDataApi('https://trifea.000webhostapp.com/api/get_trip', resp['data'][0]['track_id']);
        this.getBusTypeApi('https://trifea.000webhostapp.com/api/get_bus_type');
        this.error = false;
      } else {
        this.error = true;
        this.error_message = 'Track Not Found';
      }
    });
  }

  getTripDataApi(url, track_id) {
    var params = '?track=' + track_id.toString();
    this.http.get(url+params).toPromise().then(resp => {
      if (resp['status']) {
        this.trip_list = resp['data'];
        this.tripVisible = true;
      }
    });
  }

  watchCurrentPosition() {
    navigator.geolocation.watchPosition(
      (position: Position) => {
        this.origin_lat = position.coords.latitude;
        this.origin_lng = position.coords.longitude;
        this.setUserLocation();
        this.updateUserLoc();
      }
    );
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        if (position) {
          this.origin_lat = position.coords.latitude;
          this.origin_lng = position.coords.longitude;
        }
      });
    }
  }

  ngOnInit(): void {
    this.getCityDataApi('https://trifea.000webhostapp.com/api/get_city_list');
  }
}
