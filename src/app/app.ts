import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackOverlay } from './compartido/componentes/feedback-overlay/feedback-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
