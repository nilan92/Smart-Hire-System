import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.toastService.toastState$.subscribe(toast => {
      this.toasts.push(toast);
      this.cdr.detectChanges();
      setTimeout(() => this.remove(toast), 3000);
    });
  }

  remove(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
