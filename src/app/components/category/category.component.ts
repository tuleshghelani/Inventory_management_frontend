import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  isLoading = false;
  isEditing = false;
  editingId?: number;
  searchForm: FormGroup;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalPages = 0;
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      status: ['A', Validators.required]
    });

    this.searchForm = this.fb.group({
      search: [''],
      status: ['A']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    const searchParams = {
      ...this.searchForm.value,
      size: this.pageSize,
      page: this.currentPage
    };

    this.categoryService.searchCategories(searchParams).subscribe({
      next: (response) => {
        this.categories = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.startIndex = this.currentPage * this.pageSize;
        this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load categories');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      const category = this.categoryForm.value;

      const request = this.isEditing
        ? this.categoryService.updateCategory(this.editingId!, category)
        : this.categoryService.createCategory(category);

      request.subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Operation failed');
          this.isLoading = false;
        }
      });
    }
  }

  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      status: category.status
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: (response) => {
          this.toastr.success('Category deleted successfully');
          this.loadCategories();
        },
        error: (error) => {
          this.toastr.error('Failed to delete category');
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = undefined;
    this.categoryForm.reset({ status: 'A' });
  }

  onSearch(): void {
    this.loadCategories();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCategories();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadCategories();
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
}