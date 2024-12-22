import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductResponse, ProductSearchRequest } from '../models/product.model';
import { CacheService } from '../shared/services/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly CACHE_KEY = 'active_products';
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  searchProducts(params: ProductSearchRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/search`, params);
  }

  getProducts(params: ProductSearchRequest): Observable<any> {
    if (params.status === 'A') {
      const cachedData = this.cacheService.get(this.CACHE_KEY);
      if (cachedData) {
        return of(cachedData);
      }
    }
     return this.http.post<any>(`${this.apiUrl}/getProducts`, {
          search: params.search,
          categoryId: params.categoryId,
          status: params.status
        }).pipe(
        tap(response => {
          if (params.status === 'A' && response.success) {
            this.cacheService.set(this.CACHE_KEY, response);
          }
        })
    );
  }


  refreshProducts(): Observable<any> {
    this.cacheService.clear(this.CACHE_KEY);
    return this.getProducts({ status: 'A' });
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