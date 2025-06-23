import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as math from 'mathjs';
import { Calculation } from './calculator.model';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private displayValueSubject = new BehaviorSubject<string>('');
  private previousExpressionSubject = new BehaviorSubject<string>('');
  displayValue$ = this.displayValueSubject.asObservable();
  previousExpression$ = this.previousExpressionSubject.asObservable();

  private errorSubject = new BehaviorSubject<string|null>(null);
  error$ = this.errorSubject.asObservable();

  private currentExpression = '';
  private lastResult: string | null = null;
  private isNewExpression = true;
  private bracketCount = 0;
  private readonly historyKey = 'history';

  constructor() { }

  appendValue(value: string): void {
    this.errorSubject.next(null);
    if (this.isNewExpression) {
      this.currentExpression = '';
      this.isNewExpression = false;
      this.previousExpressionSubject.next('');
    }
    
    this.currentExpression += value;
    this.updateDisplay();
  }

  appendOperator(operator: string): void {
    this.errorSubject.next(null);
    if (operator === '-') {
      this.appendMinus();
      return;
    }
    if (this.isNewExpression && this.lastResult !== null) {
      this.currentExpression = this.lastResult;
      this.isNewExpression = false;
    }
    
    this.previousExpressionSubject.next('');
    
    const lastTwo = this.currentExpression.slice(-2);
    const lastChar = this.currentExpression.slice(-1);
    if (lastTwo.length === 2 && ['+', '-', '*', '/', '^'].includes(lastTwo[0]) && lastTwo[1] === '-') {
      this.currentExpression = this.currentExpression.slice(0, -2) + operator;
    } else if (['+', '-', '*', '/', '^'].includes(lastChar)) {
      this.currentExpression = this.currentExpression.slice(0, -1) + operator;
    } else {
      this.currentExpression += operator;
    }
    
    this.updateDisplay();
  }

  private appendMinus(): void {
    this.errorSubject.next(null);
    if (this.isNewExpression && this.lastResult !== null) {
      this.currentExpression = this.lastResult;
      this.isNewExpression = false;
    }
    
    this.previousExpressionSubject.next('');
    
    const lastChar = this.currentExpression.slice(-1);
    if (lastChar === '+' || lastChar === '-') {
      this.currentExpression = this.currentExpression.slice(0, -1) + '-';
    } else {
      this.currentExpression += '-';
    }
    
    this.isNewExpression = false;
    this.updateDisplay();
  }

  appendDecimalPoint(): void {
    this.errorSubject.next(null);
    if (this.isNewExpression) {
      this.currentExpression = '';
      this.isNewExpression = false;
      this.previousExpressionSubject.next('');
    }
    
    const parts = this.currentExpression.split(/[+*/-]/);
    const currentNumber = parts[parts.length - 1];
    if (!currentNumber.includes('.')) {
      this.currentExpression += '.';
      this.updateDisplay();
    }
  }

  calculate(): void {
    this.errorSubject.next(null);
    if(this.currentExpression.trim() === '') {
      this.errorSubject.next('Expression is empty');
      return;
    }

    if (this.bracketCount !== 0) {
      this.errorSubject.next('Mismatched brackets');
      return;
    }

    try {
      const expressionToEvaluate = this.currentExpression;
      const result = math.evaluate(expressionToEvaluate);
      
      this.previousExpressionSubject.next(expressionToEvaluate);
      
      this.lastResult = String(result);
      this.saveCalculation(expressionToEvaluate, this.lastResult);
      this.currentExpression = this.lastResult;
      this.isNewExpression = true;
      
      this.updateDisplay();
    } catch (error: any) {
      this.errorSubject.next('Invalid expression');
    }
  }

  clear(): void {
    this.errorSubject.next(null);
    this.currentExpression = '';
    this.lastResult = null;
    this.isNewExpression = true;
    this.bracketCount = 0;
    this.previousExpressionSubject.next('');
    this.updateDisplay();
  }
  
  backspace(): void {
    this.errorSubject.next(null);
    this.previousExpressionSubject.next('');
    
    if (this.isNewExpression && this.currentExpression.length > 0) {
      this.currentExpression = '';
      this.lastResult = null;
      this.updateDisplay();
      return;
    }
    
    if (this.currentExpression.length > 0) {
      const lastChar = this.currentExpression.slice(-1);
      
      if (lastChar === '(') {
        this.bracketCount--;
      } else if (lastChar === ')') {
        this.bracketCount++;
      }
      
      this.currentExpression = this.currentExpression.slice(0, -1);
      
      if (this.currentExpression.length === 0) {
        this.isNewExpression = true;
        this.lastResult = null; 
      }
      
      this.updateDisplay();
    }
  }
  
  appendOpenBracket(): void {
    this.errorSubject.next(null);
    if (this.isNewExpression) {
      this.currentExpression = '';
      this.isNewExpression = false;
      this.previousExpressionSubject.next('');
    }
    
    this.currentExpression += '(';
    this.bracketCount++;
    this.updateDisplay();
  }
  
  appendCloseBracket(): void {
    if (this.bracketCount > 0) {
      this.errorSubject.next(null);
      const lastTwo = this.currentExpression.slice(-2);
      const lastChar = this.currentExpression.slice(-1);
      if (lastTwo.length === 2 && ['+', '-', '*', '/', '^'].includes(lastTwo[0]) && lastTwo[1] === '-') {
        this.currentExpression = this.currentExpression.slice(0, -2) + ')';
      } else if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        this.currentExpression = this.currentExpression.slice(0, -1) + ')';
      } else {
        this.currentExpression += ')';
      }
      this.bracketCount--;
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    this.displayValueSubject.next(this.currentExpression);
  }

  private saveCalculation(expression: string, result: string): void {
    const stored = localStorage.getItem(this.historyKey);
    const history: Calculation[] = stored ? JSON.parse(stored) : [];
    history.push({ expression, result });
    localStorage.setItem(this.historyKey, JSON.stringify(history));
  }

  public getHistory(): Calculation[] {
    const stored = localStorage.getItem(this.historyKey);
    const result: Calculation[] = JSON.parse(stored || '[]');
    return result;
  }

  public loadCalculation(calc: Calculation): void {
    this.previousExpressionSubject.next(calc.expression);
    this.lastResult = calc.result;
    this.currentExpression = calc.result;
    this.isNewExpression = true;
    this.updateDisplay();
  }

  public clearHistory(): void {
    localStorage.removeItem(this.historyKey);
  }
}
