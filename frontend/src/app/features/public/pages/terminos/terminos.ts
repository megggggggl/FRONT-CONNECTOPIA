import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, MainLayout],
  templateUrl: './terminos.html',
  styleUrls: ['./terminos.css']
})
export class TerminosPageComponent { }