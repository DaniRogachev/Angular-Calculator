import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Calculation } from '../calculator.model';
import { FormsModule } from '@angular/forms';
import { CalculatorService } from '../calculator.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class Calculator implements OnInit, OnDestroy {
  displayValue: string = '';
  previousExpression: string = '';
  showHistory = false;
  history: Calculation[] = [];
  errorMessage: string | null = null;  
  subscription: Subscription = new Subscription();

  constructor(private calculatorService: CalculatorService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.calculatorService.displayValue$.subscribe(value => {
        this.displayValue = value;
      })
    );
    
    this.subscription.add(
      this.calculatorService.previousExpression$.subscribe(value => {
        this.previousExpression = value;
      })
    );
    this.subscription.add(
      this.calculatorService.error$.subscribe(message => {
        this.errorMessage = message;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  appendDigit(digit: string): void {
    this.calculatorService.appendValue(digit);
  }

  appendOperator(operator: string): void {
    this.calculatorService.appendOperator(operator);
  }

  appendDecimalPoint(): void {
    this.calculatorService.appendDecimalPoint();
  }

  calculate(): void {
    this.calculatorService.calculate();
  }

  clear(): void {
    this.calculatorService.clear();
  }
  
  backspace(): void {
    this.calculatorService.backspace();
  }
  

  
  appendOpenBracket(): void {
    this.calculatorService.appendOpenBracket();
  }
  
  appendCloseBracket(): void {
    this.calculatorService.appendCloseBracket();
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.history = this.calculatorService.getHistory();
    }
  }

  loadHistory(calc: Calculation): void {
    this.showHistory = false;
    this.calculatorService.loadCalculation(calc);
  }

  clearHistory(): void {
    this.calculatorService.clearHistory();
    this.showHistory = false;
    this.history = [];
  }
}
