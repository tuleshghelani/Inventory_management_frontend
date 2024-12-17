import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private displayModal = new BehaviorSubject<boolean>(false);
  display$ = this.displayModal.asObservable();

  open() {
    this.displayModal.next(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.displayModal.next(false);
    document.body.style.overflow = 'auto';
  }
} 