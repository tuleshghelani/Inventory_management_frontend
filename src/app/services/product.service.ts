import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductResponse, ProductSearchRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  searchProducts(params: ProductSearchRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/search`, params);
  }

  getProducts(params: ProductSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getProducts`, {
      search: params.search,
      categoryId: params.categoryId,
      status: params.status
    });
  }

  createProduct(product: Product): Observable<any> {
    return this.http.post(`${this.apiUrl}`, product);
  }

  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}