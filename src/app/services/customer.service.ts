import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerResponse, CustomerSearchRequest } from '../models/customer.model';
import { CacheService } from '../shared/services/cache.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CACHE_KEY = 'active_customers';
  private apiUrl = `${environment.apiUrl}/api/customers`;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  searchCustomers(params: any): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/search`, params);
  }

  createCustomer(customer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, customer);
  }

  updateCustomer(id: number, customer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, customer);
  }  

  getCustomers(params: any): Observable<any> {
    if (params.status === 'A') {
      const cachedData = this.cacheService.get(this.CACHE_KEY);
      if (cachedData) {
        return of(cachedData);
      }
    }
     return this.http.post<any>(`${this.apiUrl}/getCustomers`, {
          search: params.search
        }).pipe(
        tap(response => {
          if (params.status === 'A' && response.success) {
            this.cacheService.set(this.CACHE_KEY, response);
          }
        })
    );
  }


  refreshCustomers(): Observable<any> {
    this.cacheService.clear(this.CACHE_KEY);
    return this.getCustomers({ status: 'A' });
  }
} 