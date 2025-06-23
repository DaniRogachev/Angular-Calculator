import { Routes } from '@angular/router';
import { Home } from './home/home/home';
import { Calculator } from './calculator/calculator/calculator';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'calculator', component: Calculator },
  { path: '**', redirectTo: 'home' }
];
