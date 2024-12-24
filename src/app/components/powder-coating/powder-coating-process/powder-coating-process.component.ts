import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PowderCoatingService } from '../../../services/powder-coating.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { SearchableSelectComponent } from '../../../shared/components/searchable-select/searchable-select.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { PowderCoatingProcess } from '../../../models/powder-coating.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-powder-coating-process',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoaderComponent,
    SearchableSelectComponent,
    FormsModule,
    RouterLink
  ],
  templateUrl: './powder-coating-process.component.html',
  styleUrls: ['./powder-coating-process.component.scss']
})
export class PowderCoatingProcessComponent implements OnInit {
  processes: PowderCoatingProcess[] = [];
  products: any[] = [];
  // categories: any[] = [];
  searchForm!: FormGroup;
  isLoading = false;
  isLoadingProducts = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalPages = 0;
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private powderCoatingService: PowderCoatingService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private snackbar: SnackbarService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadProcesses();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
      productId: [''],
      categoryId: [''],
      customerId: ['']
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getProducts({ status: 'A' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
        this.isLoadingProducts = false;
      },
      error: () => {
        this.snackbar.error('Failed to load products');
        this.isLoadingProducts = false;
      }
    });
  }

  loadProcesses(): void {
    this.isLoading = true;
    const params = {
      ...this.searchForm.value,
      currentPage: this.currentPage,
      perPageRecord: this.pageSize,
      sortBy: 'id',
      sortDir: 'desc'
    };

    this.powderCoatingService.searchProcesses(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.processes = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.updatePaginationIndexes();
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackbar.error('Failed to load processes');
        this.isLoading = false;
      }
    });
  }

  private updatePaginationIndexes(): void {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProcesses();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProcesses();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadProcesses();
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage + 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  }

  

  refreshProducts(): void {
    this.isLoadingProducts = true;
    this.productService.refreshProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
          this.snackbar.success('Products refreshed successfully');
        }
        this.isLoadingProducts = false;
      },
      error: (error) => {
        this.snackbar.error('Failed to refresh products');
        this.isLoadingProducts = false;
      }
    });
  }

  deleteProcess(id: number): void {
    if (confirm('Are you sure you want to delete this process?')) {
      this.powderCoatingService.deleteProcess(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackbar.success('Process deleted successfully');
            this.loadProcesses();
          }
        },
        error: () => {
          this.snackbar.error('Failed to delete process');
        }
      });
    }
  }

  resetForm(): void {
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadProcesses();
  }
}
