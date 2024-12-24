import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PowderCoatingService } from '../../../services/powder-coating.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { DateUtils } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-return-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './return-modal.component.html',
  styleUrls: ['./return-modal.component.scss']
})
export class ReturnModalComponent implements OnDestroy {
  @Output() returnCreated = new EventEmitter<void>();
  
  display$ = new BehaviorSubject<boolean>(false);
  returnForm!: FormGroup;
  loading = false;
  processId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private powderCoatingService: PowderCoatingService,
    private snackbar: SnackbarService,
    private dateUtils: DateUtils
  ) {
    this.initForm();
  }

  private initForm(): void {
    const now = new Date();
    const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
    this.returnForm = this.fb.group({
      returnQuantity: ['', [Validators.required, Validators.min(1)]],
      returnDate: [localISOString]
    });
  }

  open(processId: number): void {
    this.processId = processId;
    this.display$.next(true);
  }

  close(): void {
    this.display$.next(false);
    this.returnForm.reset();
    this.initForm();
  }

  onSubmit(): void {
    if (this.returnForm.valid && this.processId) { 
      this.loading = true;
      const formData = this.returnForm.value;
      
      const request = {
        id: this.processId,
        returnQuantity: formData.returnQuantity,
        returnDate: formData.returnDate ? new Date(formData.returnDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-').replace(',', '') : undefined
      };

      this.powderCoatingService.createReturn(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackbar.success('Return created successfully');
              this.returnCreated.emit();
              this.close();
            }
            this.loading = false;
          },
          error: (error:any) => {
            this.snackbar.error(error?.error?.message || 'Failed to create return');
            this.loading = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 