import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Purchase } from '../../models/purchase.model';
import { SaleService } from '../../services/sale.service';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../services/modal.service';
import { map } from 'rxjs/operators';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sale-modal.component.html',
  styleUrls: ['./sale-modal.component.scss']
})
export class SaleModalComponent implements OnChanges {
  @Input() purchase!: Purchase;
  @Output() saleCreated = new EventEmitter<boolean>();
  
  saleForm!: FormGroup;
  loading = false;
  display$ = this.modalService.modalState$.pipe(
    map(state => state.isOpen)
  );

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private snackbar: SnackbarService,
    private modalService: ModalService
  ) {
    this.initForm();
  }

  private initForm() {
    // Get current date in local timezone
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    this.saleForm = this.fb.group({
      purchaseId: ['', Validators.required],  // Add Validators.required
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0)]],
      saleDate: [localISOString],
      invoiceNumber: ['', Validators.required],
      otherExpenses: [0, [Validators.min(0)]]
    });
  }

  setupForm(purchase: Purchase) {
    // Get current date in local timezone
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    this.saleForm.patchValue({
      purchaseId: purchase.id,
      unitPrice: purchase.unitPrice,
      quantity: '',
      invoiceNumber: '',
      otherExpenses: 0,
      saleDate: localISOString
    });
    
    console.log('Form values after patch:', this.saleForm.value);
    
    this.saleForm.get('quantity')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(purchase.remainingQuantity ?? 0)
    ]);
  }

  onSubmit() {
    if (this.saleForm.valid) {
      this.loading = true;
      const formData = this.saleForm.value;
      
      // Add check for purchaseId
      if (!formData.purchaseId) {
        this.snackbar.error('Purchase ID is missing');
        this.loading = false;
        return;
      }
      
      if (formData.saleDate) {
        const date = new Date(formData.saleDate);
        formData.saleDate = date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-').replace(',', '');
      }
      
      console.log('Sale form data being sent:', formData);  // Add this log

      this.saleService.createSale(formData).subscribe({
        next: (response) => {
          this.snackbar.success('Sale created successfully');
          this.saleCreated.emit(true);
          this.loading = false;
          this.close();
        },
        error: (error) => {
          this.loading = false;
          this.snackbar.error(error?.error?.message || 'Failed to create sale');
        }
      });
    }
  }

  close() {
    this.modalService.close();
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['purchase'] && changes['purchase'].currentValue) {
      this.setupForm(changes['purchase'].currentValue);
    }
  }
} 