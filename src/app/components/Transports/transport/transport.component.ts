import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { SearchableSelectComponent } from '../../../shared/components/searchable-select/searchable-select.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { Transport } from '../../../models/transport.model';
import { TransportService } from '../../../services/transport.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchableSelectComponent,
    LoaderComponent,
    RouterLink,
    ConfirmModalComponent
  ],
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {
  transportForm!: FormGroup;
  products: any[] = [];
  customers: any[] = [];
  loading = false;
  isLoadingProducts = false;
  isLoadingCustomers = false;
  showDeleteBagModal = false;
  showDeleteItemModal = false;
  deleteBagIndex: number | null = null;
  deleteItemIndices: { bagIndex: number; itemIndex: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private customerService: CustomerService,
    private transportService: TransportService,
    private snackbar: SnackbarService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
  }

  private initializeForm(): void {
    this.transportForm = this.fb.group({
      customerId: ['', [Validators.required]],
      bags: this.fb.array([])
    });
  }

  get bags(): FormArray {
    return this.transportForm.get('bags') as FormArray;
  }

  addBag(): void {
    const bagGroup = this.fb.group({
      weight: ['', [Validators.required, Validators.min(0.01)]],
      items: this.fb.array([])
    });
    this.bags.push(bagGroup);
    this.addItem(this.bags.length - 1); // Add first item automatically
  }

  removeBag(bagIndex: number): void {
    this.deleteBagIndex = bagIndex;
    this.showDeleteBagModal = true;
  }

  getBagItems(bagIndex: number): FormArray {
    return this.bags.at(bagIndex).get('items') as FormArray;
  }

  addItem(bagIndex: number): void {
    const itemGroup = this.fb.group({
      productId: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      remarks: ['']
    });
    this.getBagItems(bagIndex).push(itemGroup);
  }

  removeItem(bagIndex: number, itemIndex: number): void {
    this.deleteItemIndices = { bagIndex, itemIndex };
    this.showDeleteItemModal = true;
  }

  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerService.getCustomers({ status: 'A' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
        }
        this.isLoadingCustomers = false;
      },
      error: () => {
        this.snackbar.error('Failed to load customers');
        this.isLoadingCustomers = false;
      }
    });
  }

  refreshCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerService.refreshCustomers().subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
          this.snackbar.success('Customers refreshed successfully');
        }
        this.isLoadingCustomers = false;
      },
      error: () => {
        this.snackbar.error('Failed to refresh customers');
        this.isLoadingCustomers = false;
      }
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
      error: () => {
        this.snackbar.error('Failed to refresh products');
        this.isLoadingProducts = false;
      }
    });
  }

  isFieldInvalid(field: any): boolean {
    return field?.invalid && (field?.dirty || field?.touched);
  }

  getFieldError(field: any): string {
    if (!field) return '';
    
    if (field.hasError('required')) {
      return 'This field is required';
    }
    
    if (field.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Value must be greater than ${min}`;
    }
    
    return '';
  }

  getCustomErrorMessage(field: any, fieldName: string): string {
    if (!field?.errors) return '';
    
    if (field.hasError('required')) {
      return `Please enter ${fieldName}`;
    }
    
    if (field.hasError('min')) {
      const min = field.errors?.['min'].min;
      if (fieldName === 'weight') {
        return `Weight must be greater than ${min}kg`;
      }
      return `${fieldName} must be greater than ${min}`;
    }
    
    return '';
  }

  validateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate customer selection
    if (!this.transportForm.get('customerId')?.value) {
      errors.push('Please select a customer');
    }

    // Validate bags
    if (this.bags.length === 0) {
      errors.push('Please add at least one bag');
    } else {
      this.bags.controls.forEach((bag, bagIndex) => {
        // Validate bag weight
        if (!bag.get('weight')?.value) {
          errors.push(`Please enter weight for Bag #${bagIndex + 1}`);
        } else if (bag.get('weight')?.errors?.['min']) {
          errors.push(`Weight must be greater than 0kg for Bag #${bagIndex + 1}`);
        }

        // Validate bag items
        const items = this.getBagItems(bagIndex);
        if (items.length === 0) {
          errors.push(`Please add at least one item in Bag #${bagIndex + 1}`);
        } else {
          items.controls.forEach((item, itemIndex) => {
            if (!item.get('productId')?.value) {
              errors.push(`Please select product for item ${itemIndex + 1} in Bag #${bagIndex + 1}`);
            }
            if (!item.get('quantity')?.value) {
              errors.push(`Please enter quantity for item ${itemIndex + 1} in Bag #${bagIndex + 1}`);
            } else if (item.get('quantity')?.errors?.['min']) {
              errors.push(`Quantity must be greater than 0 for item ${itemIndex + 1} in Bag #${bagIndex + 1}`);
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  onSubmit(): void {
    const validation = this.validateForm();
    
    if (validation.isValid) {
      this.loading = true;
      this.transportService.createTransport(this.transportForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackbar.success('Transport created successfully');
            this.resetForm();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackbar.error(error?.error?.message || 'Failed to create transport');
          this.loading = false;
        }
      });
    } else {
      // Show all validation errors
      validation.errors.forEach(error => {
        this.snackbar.error(error);
      });
      this.markFormGroupTouched(this.transportForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  resetForm(): void {
    this.transportForm.reset();
    while (this.bags.length) {
      this.bags.removeAt(0);
    }
  }

  onDeleteBag(bagIndex: number): void {
    this.deleteBagIndex = bagIndex;
    this.showDeleteBagModal = true;
  }

  onDeleteItem(bagIndex: number, itemIndex: number): void {
    this.deleteItemIndices = { bagIndex, itemIndex };
    this.showDeleteItemModal = true;
  }

  confirmDeleteBag(): void {
    if (this.deleteBagIndex !== null) {
      this.bags.removeAt(this.deleteBagIndex);
      this.showDeleteBagModal = false;
      this.deleteBagIndex = null;
    }
  }

  confirmDeleteItem(): void {
    if (this.deleteItemIndices) {
      const { bagIndex, itemIndex } = this.deleteItemIndices;
      const items = this.getBagItems(bagIndex);
      if (items.length > 1) {
        items.removeAt(itemIndex);
      }
      this.showDeleteItemModal = false;
      this.deleteItemIndices = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteBagModal = false;
    this.showDeleteItemModal = false;
    this.deleteBagIndex = null;
    this.deleteItemIndices = null;
  }
}
