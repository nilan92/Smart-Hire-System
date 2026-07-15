import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toastState$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => this.remove(toast), 3000);
    });
  }

  remove(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
