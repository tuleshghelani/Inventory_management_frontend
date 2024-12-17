import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CategoryResponse, CategorySearchRequest } from '../models/category.model';
import { ApiResponse, PaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getCategories(params: CategorySearchRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.apiUrl}/getCategories`, params);
  }

  searchCategories(params: CategorySearchRequest): Observable<ApiResponse<PaginatedResponse<Category>>> {
    return this.http.post<ApiResponse<PaginatedResponse<Category>>>(`${this.apiUrl}/search`, {
      size: params.size,
      page: params.page,
      search: params.search,
      status: params.status
    });
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(`${this.apiUrl}`, category);
  }

  updateCategory(id: number, category: Category): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}