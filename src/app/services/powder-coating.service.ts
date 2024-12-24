import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PowderCoatingResponse, PowderCoatingSearchRequest } from '../models/powder-coating.model';

@Injectable({
  providedIn: 'root'
})
export class PowderCoatingService {
  private apiUrl = `${environment.apiUrl}/api/powder-coating`;

  constructor(private http: HttpClient) {}

  searchProcesses(params: PowderCoatingSearchRequest): Observable<PowderCoatingResponse> {
    return this.http.post<PowderCoatingResponse>(`${this.apiUrl}/search`, params);
  }

  createProcess(data: {
    customerId: number;
    productId: number;
    quantity: number;
    status: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateProcess(id: number, data: {
    customerId: number;
    productId: number;
    quantity: number;
    status: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteProcess(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  

  getProcess(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getProcess`, { id });
  }
} 