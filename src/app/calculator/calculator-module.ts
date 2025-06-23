import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Calculator } from './calculator/calculator';

const routes: Routes = [
  { path: '', component: Calculator }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Calculator
  ]
})
export class CalculatorModule { }
