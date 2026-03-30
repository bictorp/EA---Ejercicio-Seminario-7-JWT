import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, Usuario } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tokenPreview = '';
  usuarios: Usuario[] = [];
  loadingUsuarios = false;
  errorUsuarios = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || '';
    // Ahora mostramos el token completo para poder ver los cambios de firma
    this.tokenPreview = token;
    console.log('Token actual:', token);
  }

  logout(): void {
    this.authService.logout();
  }

  goToAdminDashboard(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  cargarUsuarios(): void {
    this.loadingUsuarios = true;
    this.errorUsuarios = '';

    this.authService.getUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.loadingUsuarios = false;
      },
      error: (err: any) => {
        this.errorUsuarios = err.error?.message || 'Error al cargar usuarios';
        this.loadingUsuarios = false;
      }
    });
  }

  refreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: (res: { accessToken: string }) => {
        const token = res.accessToken;
        this.tokenPreview = token; // Mostramos el token completo
        console.log('Nuevo Token refrescado:', token);
        alert('Token refrescado correctamente. Revisa la consola para comparar.');
      },
      error: (err: any) => {
        this.errorUsuarios = err.error?.message || 'Error al refrescar el token';
      }
    });
  }
}
