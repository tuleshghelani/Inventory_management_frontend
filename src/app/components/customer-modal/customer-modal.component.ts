import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../services/modal.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.scss']
})
export class CustomerModalComponent implements OnInit {
  @Output() customerCreated = new EventEmitter<boolean>();
  
  customerForm!: FormGroup;
  loading = false;
  isSubmitted = false;
  display$ = this.modalService.modalState$.pipe(
    map(state => state.isOpen && state.modalType === 'customer')
  );

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      gst: ['', [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      address: ['', Validators.required],
      remainingPaymentAmount: [0, [Validators.required, Validators.min(0)]],
      nextActionDate: [localISOString],
      remarks: [''],
      status: ['A']
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.customerForm.valid) {
      this.loading = true;
      const formData = this.customerForm.value;
      
      if (formData.nextActionDate) {
        const date = new Date(formData.nextActionDate);
        formData.nextActionDate = date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-').replace(',', '');
      }

      this.customerService.createCustomer(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(response.message);
            this.customerCreated.emit(true);
            this.close();
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to create customer');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  close() {
    this.modalService.close();
    this.customerForm.reset();
    this.isSubmitted = false;
  }
} 