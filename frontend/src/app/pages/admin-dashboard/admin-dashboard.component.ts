// Ejercicio JWT:
//Esta es la pantalla VIP. Solo la ve la gente con pulsera de admin.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  message: string = '';
  data: string = '';
  error: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAdminDashboard().subscribe({
      next: (res) => {
        this.message = res.message;
        this.data = res.data;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error accessing admin dashboard. You might not have the right permissions.';
      }
    });
  }
}
