import { SheetData } from '../types';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const getColIndex = (colStr: string): number => {
  let sum = 0;
  for (let i = 0; i < colStr.length; i++) {
    sum *= 26;
    sum += (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return sum - 1;
};

export const evaluateFormula = (formula: string, data: SheetData): string => {
  if (!formula || !formula.startsWith('=')) return formula;

  // Strip '='
  let expression = formula.substring(1).toUpperCase();

  // Helper to retrieve cell value
  const getValue = (colStr: string, rowStr: string) => {
    const colIndex = getColIndex(colStr);
    const rowIndex = parseInt(rowStr, 10) - 2; // Row 1 is header, Row 2 is index 0
    
    // Safety check bounds
    if (rowIndex < 0 || rowIndex >= data.length) return 0;
    
    const row = data[rowIndex];
    if (!row) return 0;
    
    const cell = row[colIndex];
    if (!cell) return 0;
    
    const val = cell.value;
    
    // If referencing another formula, we might want to evaluate it recursively?
    // For simplicity/performance, we take raw value. If it's a number, return number.
    // If it's a string, return quoted string.
    const num = parseFloat(val);
    return isNaN(num) ? `"${val.replace(/"/g, '\\"')}"` : (val === '' ? 0 : val);
  };

  // 1. Resolve Ranges (e.g. A1:B3)
  // Matches Pattern: ColumnRow : ColumnRow (allowing for spaces)
  expression = expression.replace(/([A-Z]+)([0-9]+)\s*:\s*([A-Z]+)([0-9]+)/g, (match, c1, r1, c2, r2) => {
    const startCol = getColIndex(c1);
    const endCol = getColIndex(c2);
    const startRow = parseInt(r1, 10);
    const endRow = parseInt(r2, 10);
    
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    
    const values = [];
    
    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            const rowIndex = r - 2;
            if (rowIndex >= 0 && rowIndex < data.length) {
                const cellVal = data[rowIndex]?.[c]?.value;
                const num = parseFloat(cellVal);
                // For ranges, if it's text, we quote it, otherwise strictly use the value. 
                // Aggregate functions will handle filtering types.
                values.push(isNaN(num) ? (cellVal ? `"${cellVal.replace(/"/g, '\\"')}"` : '0') : (cellVal === '' ? '0' : cellVal));
            } else {
                values.push('0');
            }
        }
    }
    return values.join(',');
  });

  // 2. Replace Cell References (e.g. A2, AA10)
  // Regex matches [A-Z] followed by [0-9]
  expression = expression.replace(/([A-Z]+)([0-9]+)/g, (match, col, row) => {
    return String(getValue(col, row));
  });

  // 3. Transpile Common Excel/Sheet Operators to JS
  expression = expression.replace(/&/g, '+'); // String Concatenation
  expression = expression.replace(/(?<!<|>|!)=/g, '==='); // Equality

  // 4. Define Context Functions
  const context = {
    SUM: (...args: any[]) => args.reduce((a, b) => {
        const n = Number(b);
        return a + (isNaN(n) ? 0 : n);
    }, 0),
    AVERAGE: (...args: any[]) => {
        const nums = args.map(Number).filter(n => !isNaN(n));
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    },
    MIN: (...args: any[]) => Math.min(...args.map(Number).filter(n => !isNaN(n))),
    MAX: (...args: any[]) => Math.max(...args.map(Number).filter(n => !isNaN(n))),
    COUNT: (...args: any[]) => args.filter(a => a !== '' && a !== null && !isNaN(Number(a))).length,
    IF: (condition: any, trueVal: any, falseVal: any) => condition ? trueVal : falseVal,
  };

  try {
    // 5. Create Function with Scope
    const keys = Object.keys(context);
    const values = Object.values(context);
    
    // Safety: Basic sanitization
    if (expression.includes('fetch') || expression.includes('window') || expression.includes('document')) {
        return '#BLOCKED';
    }

    const func = new Function(...keys, `return (${expression});`);
    const result = func(...values);

    if (result === undefined || result === null) return '';
    return String(result);
  } catch (error) {
    // console.error(error);
    return '#ERROR';
  }
};