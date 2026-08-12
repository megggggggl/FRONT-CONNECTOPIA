import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedbackService } from '../../../../core/services/feedback.service';

type BillingPeriod = 'mensual' | 'anual';

@Component({
  selector: 'app-premium',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './premium.html',
  styleUrl: './premium.css'
})
export class PremiumPageComponent {
  billing: BillingPeriod = 'mensual';

  readonly premiumBenefits = [
    'Mayor visibilidad en los resultados de servicios',
    'Insignia Premium en tu perfil y publicaciones',
    'Estadísticas avanzadas de visitas y solicitudes',
    'Hasta 15 servicios publicados al mismo tiempo',
    'Soporte prioritario para tu negocio'
  ];

  constructor(private readonly feedback: FeedbackService) {}

  get price(): string {
    return this.billing === 'mensual' ? '$9.99' : '$99.00';
  }

  get periodLabel(): string {
    return this.billing === 'mensual' ? 'al mes' : 'al año';
  }

  selectBilling(period: BillingPeriod): void {
    this.billing = period;
  }

  requestPremium(): void {
    this.feedback.info('La activación y el pago de Premium estarán disponibles próximamente.');
  }
}
