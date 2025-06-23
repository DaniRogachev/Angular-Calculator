import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';

const routes: Routes = [
  { path: '', component: Home }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Home
  ]
})
export class HomeModule { }
