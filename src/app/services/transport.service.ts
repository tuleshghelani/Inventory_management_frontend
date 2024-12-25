import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = `${environment.apiUrl}/api/transport`;

  constructor(private http: HttpClient) {}

  createTransport(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  getTransports(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`, { params });
  }

  getTransport(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // updateTransport(id: number, data: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, data);
  // }

  deleteTransport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchTransports(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, params );
  }

  getTransportDetail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/detail`, { id });
  }

  updateTransport(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }
} 