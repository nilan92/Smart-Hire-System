import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-moderation.html',
  styleUrls: ['./service-moderation.scss']
})
export class ServiceModerationComponent implements OnInit {
  services = [
    { id: 101, title: 'Expert Plumbing Repair', provider: 'Bob Jones', status: 'pending' },
    { id: 102, title: 'House Cleaning', provider: 'Alice Smith', status: 'active' },
    { id: 103, title: 'Wiring & Electrical', provider: 'Charlie Brown', status: 'rejected' }
  ];

  ngOnInit(): void {}

  updateStatus(service: any, newStatus: string): void {
    service.status = newStatus;
  }
}
