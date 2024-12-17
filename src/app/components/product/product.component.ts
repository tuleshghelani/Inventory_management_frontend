import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  productForm!: FormGroup;
  searchForm!: FormGroup;
  isLoading = false;
  isEditing = false;
  editingId?: number;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalPages = 0;
  totalElements = 0;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private initializeForms(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      status: ['A', Validators.required]
    });

    this.searchForm = this.fb.group({
      search: [''],
      categoryId: [''],
      status: ['A']
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories({ status: 'A' }).subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: () => {
        this.toastr.error('Failed to load categories');
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    const searchParams = {
      ...this.searchForm.value,
      size: this.pageSize,
      page: this.currentPage
    };

    this.productService.searchProducts(searchParams).subscribe({
      next: (response) => {
        this.products = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.startIndex = this.currentPage * this.pageSize;
        this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load products');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const product = this.productForm.value;

      const request = this.isEditing
        ? this.productService.updateProduct(this.editingId!, product)
        : this.productService.createProduct(product);

      request.subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.resetForm();
          this.loadProducts();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Operation failed');
          this.isLoading = false;
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.editingId = product.id;
    this.productForm.patchValue({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      minimumStock: product.minimumStock,
      status: product.status
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('Product deleted successfully');
          this.loadProducts();
        },
        error: () => {
          this.toastr.error('Failed to delete product');
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = undefined;
    this.productForm.reset({ status: 'A' });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadProducts();
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