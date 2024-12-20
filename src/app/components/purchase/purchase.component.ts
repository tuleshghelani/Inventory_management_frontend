import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseService } from '../../services/purchase.service';
import { Purchase } from '../../models/purchase.model';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SaleModalComponent } from '../sale-modal/sale-modal.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
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

  constructor(
    private purchaseService: PurchaseService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private modalService: ModalService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPurchases();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
      categoryId: [''],
      productId: ['']
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
      error: () => {
        this.toastr.error('Failed to load purchases');
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
}
