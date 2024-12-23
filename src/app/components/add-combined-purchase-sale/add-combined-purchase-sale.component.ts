import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { SearchableSelectComponent } from '../../shared/components/searchable-select/searchable-select.component';
import { ProductService } from '../../services/product.service';
import { CombinedPurchaseSaleService } from '../../services/combined-purchase-sale.service';
@Component({
 selector: 'app-add-combined-purchase-sale',
 standalone: true,
 imports: [
   CommonModule,
   ReactiveFormsModule,
   RouterModule,
   LoaderComponent,
   SearchableSelectComponent
 ],
 templateUrl: './add-combined-purchase-sale.component.html',
 styleUrls: ['./add-combined-purchase-sale.component.scss']
})
export class AddCombinedPurchaseSaleComponent implements OnInit {
 combinedForm!: FormGroup;
 products: any[] = [];
 loading = false;
 isLoadingProducts = false;
  constructor(
   private fb: FormBuilder,
   private productService: ProductService,
   private combinedService: CombinedPurchaseSaleService,
   private snackbar: SnackbarService
 ) {
   this.initForm();
 }
  ngOnInit() {
   this.loadProducts();
 }
  private initForm() {
   // Get current date in local timezone
   const now = new Date();
   const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
     .toISOString()
     .slice(0, 16);
    this.combinedForm = this.fb.group({
     productId: ['', Validators.required],
     purchaseUnitPrice: ['', [Validators.required, Validators.min(0.01)]],
     purchaseDate: [localISOString, Validators.required],
     purchaseInvoiceNumber: [''],
     purchaseOtherExpenses: [0, [Validators.required, Validators.min(0)]],
     quantity: ['', [Validators.required, Validators.min(1)]],
     saleUnitPrice: ['', [Validators.required, Validators.min(0.01)]],
     saleDate: [localISOString, Validators.required],
     saleInvoiceNumber: [''],
     saleOtherExpenses: [0, [Validators.required, Validators.min(0)]]
   });
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
  onSubmit() {
   if (this.combinedForm.valid) {
     this.loading = true;
     const formData = this.combinedForm.value;
     
     // Format dates
     ['purchaseDate', 'saleDate'].forEach(dateField => {
       if (formData[dateField]) {
         const date = new Date(formData[dateField]);
         formData[dateField] = date.toLocaleString('en-GB', {
           day: '2-digit',
           month: '2-digit',
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit',
           second: '2-digit'
         }).replace(/\//g, '-').replace(',', '');
       }
     });
      this.combinedService.createCombinedPurchaseSale(formData).subscribe({
       next: (response:any) => {
         this.snackbar.success('Combined purchase and sale created successfully');
         this.resetForm();
         this.loading = false;
       },
       error: (error:any) => {
         this.snackbar.error(error?.error?.message || 'Failed to create combined purchase and sale');
         this.loading = false;
       }
     });
   }
 }
  resetForm(): void {
   const now = new Date();
   const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
     .toISOString()
     .slice(0, 16);
    this.combinedForm.reset({
     purchaseDate: localISOString,
     saleDate: localISOString,
     purchaseOtherExpenses: 0,
     saleOtherExpenses: 0
   });
 }
  isFieldInvalid(fieldName: string): boolean {
   const field = this.combinedForm.get(fieldName);
   return field ? field.invalid && (field.dirty || field.touched) : false;
 }
  getFieldError(fieldName: string): string {
   const control = this.combinedForm.get(fieldName);
   if (control?.errors) {
     if (control.errors['required']) return `${fieldName} is required`;
     if (control.errors['min']) return `${fieldName} must be greater than ${control.errors['min'].min}`;
   }
   return '';
 }

}