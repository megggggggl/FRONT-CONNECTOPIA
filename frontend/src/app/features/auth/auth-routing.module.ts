import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { VerificationForm } from './components/verification-form/verification-form';

const routes: Routes = [
  { path: '', component: Auth },
  { path: 'verificacion', component: VerificationForm } // ✅ Esta ruta debe existir
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }