import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    const s = (status || '').toLowerCase();
    const colors: Record<string, string> = {
      'activo': '#22c55e',
      'active': '#22c55e',
      'en_curso': '#22c55e',
      'programado': '#f59e0b',
      'pending': '#f59e0b',
      'pendiente': '#f59e0b',
      'finalizado': '#3b82f6',
      'completed': '#3b82f6',
      'cancelado': '#ef4444',
      'cancelled': '#ef4444',
      'bloqueado': '#ef4444',
      'inactive': '#64748b',
      'inactivo': '#64748b'
    };
    return colors[s] || '#64748b';
  }
}