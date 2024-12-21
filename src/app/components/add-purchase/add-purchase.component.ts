import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PurchaseService } from '../../services/purchase.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoaderComponent
  ],
  templateUrl: './add-purchase.component.html',
  styleUrls: ['./add-purchase.component.scss']
})
export class AddPurchaseComponent implements OnInit {
  purchaseForm!: FormGroup;
  products: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private snackbar: SnackbarService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.fetchProducts();
  }

  private initForm() {
    // Get current date in local timezone
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    this.purchaseForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      purchaseDate: [localISOString, Validators.required],
      invoiceNumber: ['', Validators.required],
      otherExpenses: [0, [Validators.required, Validators.min(0)]]
    });
  }

  fetchProducts() {
    this.loading = true;
    this.productService.getProducts({ status: 'A' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
      },
      error: (error) => {
        this.snackbar.error('Failed to fetch products');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.purchaseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.purchaseForm.get(fieldName);
    if (field?.errors && field.touched) {
      return `${fieldName} is required`;
    }
    if (field?.errors && field.errors['min']) {
      if (fieldName === 'quantity') return 'Quantity must be greater than 0';
        if (fieldName === 'unitPrice') return 'Unit price must be greater than 0';
      if (fieldName === 'otherExpenses') return 'Other expenses must be greater than or equal to 0';
    }
    return '';
  }

  resetForm() {
    this.initForm();
  }

  onSubmit() {
    if (this.purchaseForm.valid) {
      this.loading = true;
      const formData = this.purchaseForm.value;
      
      if (formData.purchaseDate) {
        const date = new Date(formData.purchaseDate);
        formData.purchaseDate = date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-').replace(',', '');
      }

      this.purchaseService.createPurchase(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackbar.success('Purchase created successfully');
            this.resetForm();
            this.loading = false;
          }
        },
        error: (error) => {
          this.snackbar.error('Failed to create purchase');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.purchaseForm.controls).forEach(key => {
        const control = this.purchaseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
