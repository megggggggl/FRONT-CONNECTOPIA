import { Injectable, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error' | 'info';

export interface FeedbackToast { id: number; message: string; kind: FeedbackKind; }
export interface FeedbackDialog {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
  input: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly toasts = signal<FeedbackToast[]>([]);
  readonly dialog = signal<FeedbackDialog | null>(null);
  private nextId = 0;
  private resolveDialog: ((value: any) => void) | null = null;

  success(message: string): void { this.toast(message, 'success'); }
  error(message: string): void { this.toast(message, 'error'); }
  info(message: string): void { this.toast(message, 'info'); }

  confirm(message: string, options: Partial<FeedbackDialog> = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveDialog = resolve;
      this.dialog.set({ title: options.title ?? 'Confirmar acción', message, confirmText: options.confirmText ?? 'Confirmar', cancelText: options.cancelText ?? 'Cancelar', danger: options.danger ?? false, input: false, inputValue: '' });
    });
  }

  prompt(message: string, options: Partial<FeedbackDialog> = {}): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolveDialog = resolve;
      this.dialog.set({ title: options.title ?? 'Completar información', message, confirmText: options.confirmText ?? 'Continuar', cancelText: options.cancelText ?? 'Cancelar', danger: options.danger ?? false, input: true, inputLabel: options.inputLabel, inputPlaceholder: options.inputPlaceholder, inputValue: options.inputValue ?? '' });
    });
  }

  resolve(value: boolean | string | null): void {
    this.resolveDialog?.(value);
    this.resolveDialog = null;
    this.dialog.set(null);
  }

  updateInput(value: string): void {
    this.dialog.update((dialog) => dialog ? { ...dialog, inputValue: value } : null);
  }

  dismissToast(id: number): void { this.toasts.update((items) => items.filter((item) => item.id !== id)); }

  private toast(message: string, kind: FeedbackKind): void {
    const id = ++this.nextId;
    this.toasts.update((items) => [...items, { id, message, kind }]);
    window.setTimeout(() => this.dismissToast(id), 3600);
  }
}
