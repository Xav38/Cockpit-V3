import { FieldValue, Formula } from '../types/formula';

// Obtient la valeur numérique d'un FieldValue
export function getNumericValue(fieldValue: FieldValue): number {
  if (!fieldValue.isFormula) {
    return typeof fieldValue.value === 'number' ? fieldValue.value : 0;
  }
  
  const formula = fieldValue.value as Formula;
  return formula.result || 0;
}

// Crée un FieldValue simple (non-formule)
export function createSimpleFieldValue(value: number): FieldValue {
  return {
    value: value,
    isFormula: false
  };
}

// Crée un FieldValue de formule
export function createFormulaFieldValue(expression: string, result?: number): FieldValue {
  const formula: Formula = {
    expression,
    isValid: true,
    dependencies: [],
    result
  };
  
  return {
    value: formula,
    isFormula: true
  };
}

// Met à jour un FieldValue
export function updateFieldValue(
  current: FieldValue,
  newValue: number | string,
  isFormula: boolean = false
): FieldValue {
  if (isFormula && typeof newValue === 'string') {
    return createFormulaFieldValue(newValue);
  }
  
  if (!isFormula && typeof newValue === 'number') {
    return createSimpleFieldValue(newValue);
  }
  
  return current;
}

// Vérifie si un FieldValue est une formule valide
export function isValidFormula(fieldValue: FieldValue): boolean {
  if (!fieldValue.isFormula) return true;
  
  const formula = fieldValue.value as Formula;
  return formula.isValid;
}

// Obtient le message d'erreur d'une formule
export function getFormulaError(fieldValue: FieldValue): string | undefined {
  if (!fieldValue.isFormula) return undefined;
  
  const formula = fieldValue.value as Formula;
  return formula.error;
}

// Obtient l'expression d'une formule
export function getFormulaExpression(fieldValue: FieldValue): string | undefined {
  if (!fieldValue.isFormula) return undefined;
  
  const formula = fieldValue.value as Formula;
  return formula.expression;
}