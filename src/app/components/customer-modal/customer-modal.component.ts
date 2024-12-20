import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../services/modal.service';
import { map } from 'rxjs/operators';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-modal',
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.scss']
})
export class CustomerModalComponent implements OnInit {
  @Input() customer?: Customer;
  @Output() customerSaved = new EventEmitter<boolean>();
  
  customerForm!: FormGroup;
  loading = false;
  isSubmitted = false;
  display$ = this.modalService.modalState$.pipe(
    map(state => state.isOpen && state.modalType === 'customer')
  );
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.initForm();
    this.modalService.modalState$.subscribe(state => {
      if (state.isOpen && state.data) {
        this.isEditing = true;
        this.patchForm(state.data);
      } else {
        this.isEditing = false;
      }
    });
  }

  private initForm() {
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    this.customerForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      mobile: ['', []],
      email: ['', [Validators.email]],
      gst: ['', [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      address: ['',[]],
      remainingPaymentAmount: [0, [Validators.required, Validators.min(0)]],
      nextActionDate: [localISOString],
      remarks: [''],
      status: ['A']
    });
  }

  private patchForm(customer: Customer) {
    const nextActionDate = customer.nextActionDate ? 
      new Date(customer.nextActionDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'))
        .toISOString().slice(0, 16) : '';

    this.customerForm.patchValue({
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      gst: customer.gst,
      address: customer.address,
      remainingPaymentAmount: customer.remainingPaymentAmount,
      nextActionDate: nextActionDate,
      remarks: customer.remarks,
      status: customer.status
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

      const request = this.isEditing ?
        this.customerService.updateCustomer(this.customer!.id, formData) :
        this.customerService.createCustomer(formData);

      request.subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(response.message || 
              `Customer ${this.isEditing ? 'updated' : 'created'} successfully`);
            this.customerSaved.emit(true);
            this.close();
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 
            `Failed to ${this.isEditing ? 'update' : 'create'} customer`);
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