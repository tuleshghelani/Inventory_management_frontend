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
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfits();
  }

  onSearch() {
    this.searchTerm = this.searchForm.get('search')?.value;
    this.currentPage = 0;
    this.loadProfits();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadProfits();
  }

  loadProfits() {
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm
    };

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
}
