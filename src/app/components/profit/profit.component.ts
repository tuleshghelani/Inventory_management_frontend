import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ProfitService } from '../../services/profit.service';

interface ProfitResponse {
  success: boolean;
  message: string;
  data: {
    totalPages: number;
    content: Profit[];
    totalElements: number;
  };
}

interface Profit {
  id: number;
  productName: string;
  saleInvoice: string;
  saleAmount: number;
  purchaseAmount: number;
  otherExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitDate: string;
  productId: number;
}

@Component({
  selector: 'app-profit',
  templateUrl: './profit.component.html',
  styleUrls: ['./profit.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class ProfitComponent implements OnInit {
  profits: any;
  currentPage = 0;
  pageSize = 5;
  searchTerm = '';
  searchForm: FormGroup;
  pageSizeOptions = [5, 10, 25, 50];
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private profitService: ProfitService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfits();
  }

  private formatDateForApi(dateStr: string, isStartDate: boolean): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const time = isStartDate ? '00:00:00' : '23:59:59';

    return `${day}-${month}-${year} ${time}`;
  }

  onSearch() {
    const formValues = this.searchForm.value;
    
    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
    };

    if (formValues.search?.trim()) {
      params.search = formValues.search.trim();
    }

    if (formValues.startDate) {
      params.startDate = this.formatDateForApi(formValues.startDate, true);
    }
    
    if (formValues.endDate) {
      params.endDate = this.formatDateForApi(formValues.endDate, false);
    }

    this.profitService.searchProfits(params).subscribe({
      next: (response) => {
        this.profits = response.data;
        this.totalElements = response.data.totalElements;
        this.updatePaginationIndexes();
      },
      error: (error) => {
        console.error('Error loading profits:', error);
      }
    });
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadProfits();
  }

  loadProfits() {
    const formValues = this.searchForm.value;
    
    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
    };

    // Only add search if it's not empty
    if (formValues.search?.trim()) {
      params.search = formValues.search.trim();
    }

    // Only add dates if they are selected
    if (formValues.startDate) {
      params.startDate = this.formatDateForApi(formValues.startDate, true);
    }
    
    if (formValues.endDate) {
      params.endDate = this.formatDateForApi(formValues.endDate, false);
    }

    this.profitService.searchProfits(params).subscribe({
      next: (response) => {
        this.profits = response.data;
        this.totalElements = response.data.totalElements;
        this.updatePaginationIndexes();
      },
      error: (error) => {
        console.error('Error loading profits:', error);
      }
    });
  }

  loadPage(page: number) {
    if (page >= 0 && page < this.profits?.totalPages) {
      this.currentPage = page;
      this.loadProfits();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.profits?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  private updatePaginationIndexes() {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalElements);
  }

  resetForm(): void {
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadProfits();
  }
}
