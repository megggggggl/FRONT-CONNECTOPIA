import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({ selector: 'app-feedback-overlay', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './feedback-overlay.html', styleUrl: './feedback-overlay.css' })
export class FeedbackOverlay {
  readonly feedback = inject(FeedbackService);
  confirmar(): void { const dialog = this.feedback.dialog(); this.feedback.resolve(dialog?.input ? dialog.inputValue : true); }
}
