import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PurchaseService } from '../../services/purchase.service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-purchase',
  templateUrl: './add-purchase.component.html',
  styleUrl: './add-purchase.component.scss'
})
export class AddPurchaseComponent implements OnInit {
  purchaseForm: FormGroup;
  products: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private toastr: ToastrService
  ) {
    this.purchaseForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0)]],
      purchaseDate: [''],
      invoiceNumber: ['', Validators.required],
      otherExpenses: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getProducts({ status: 'A' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
      },
      error: (error) => {
        this.toastr.error('Failed to fetch products');
      }
    });
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
        next: (response: any) => {
          if (response.success) {
            this.toastr.success(response.message);
            this.purchaseForm.reset();
          }
        },
        error: (error) => {
          this.toastr.error('Failed to create purchase');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
