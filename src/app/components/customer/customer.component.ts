import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { CustomerModalComponent } from '../customer-modal/customer-modal.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  customers: Customer[] = [];
  searchForm!: FormGroup;
  isLoading = false;
  displayModal = false;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalPages = 0;
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public modalService: ModalService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    const params = {
      currentPage: this.currentPage,
      perPageRecord: this.pageSize,
      search: this.searchForm.get('search')?.value
    };
  
    this.customerService.searchCustomers(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.updatePaginationIndexes();
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load customers');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadCustomers();
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

  private updatePaginationIndexes(): void {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalElements);
  }

  // Update the openCustomerModal method
  openCustomerModal(customer?: Customer) {
    this.modalService.open('customer', customer);
    // Subscribe to modal state changes
    this.modalService.modalState$.subscribe(state => {
      if (!state.isOpen) {
        // When modal closes, reload customers
        // this.loadCustomers();
      }
    });
  }
}
