import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerResponse, CustomerSearchRequest } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  searchCustomers(params: any): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/search`, params);
  }

  createCustomer(customer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, customer);
  }

  updateCustomer(id: number, customer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, customer);
  }
} 