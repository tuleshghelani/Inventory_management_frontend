import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseService } from '../../services/purchase.service';
import { Purchase } from '../../models/purchase.model';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SaleModalComponent } from '../sale-modal/sale-modal.component';
import { ModalService } from '../../services/modal.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { SearchableSelectComponent } from '../../shared/components/searchable-select/searchable-select.component';
import { DateUtils } from '../../shared/utils/date-utils';
import { CacheService } from '../../shared/services/cache.service';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterModule,
    MatDialogModule,
    SaleModalComponent,
    LoaderComponent,
    SearchableSelectComponent
  ],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: Purchase[] = [];
  searchForm!: FormGroup;
  isLoading = false;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalPages = 0;
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;
  selectedPurchase: Purchase | null = null;
  products: Product[] = [];
  isLoadingProducts = false;

  constructor(
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private dialog: MatDialog,
    private modalService: ModalService,
    private dateUtils: DateUtils,
    private cacheService: CacheService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPurchases();
    this.loadProducts();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
      productId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  loadPurchases(): void {
    this.isLoading = true;
    const params = {
      currentPage: this.currentPage,
      perPageRecord: this.pageSize,
      ...this.searchForm.value
    };

    this.purchaseService.searchPurchases(params).subscribe({
      next: (response) => {
        this.purchases = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.startIndex = this.currentPage * this.pageSize;
        this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
        this.isLoading = false;
      },
      error: (error) => {
        this.snackbar.error(error.message || 'Failed to load purchases');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadPurchases();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPurchases();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadPurchases();
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

  openSaleModal(purchase: Purchase) {
    this.selectedPurchase = purchase;
    this.modalService.open('sale');
  }

  deletePurchase(id: number): void {
    if (confirm('Are you sure you want to delete this purchase? This action cannot be undone.')) {
      this.isLoading = true;
      this.purchaseService.deletePurchase(id).subscribe({
        next: () => {
          this.snackbar.success('Purchase deleted successfully');
          this.loadPurchases();
        },
        error: (error) => {
          this.snackbar.error(error?.error?.message || 'Failed to delete purchase');
          this.isLoading = false;
        }
      });
    }
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getProducts({ status: 'A' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
        this.isLoadingProducts = false;
      },
      error: (error) => {
        this.snackbar.error('Failed to load products');
        this.isLoadingProducts = false;
      }
    });
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

  resetForm(): void {
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadPurchases();
  }
}
