// Types pour le système de formules
export interface FormulaField {
  id: string;
  label: string;
  path: string;
  type: 'number' | 'calculated';
  category: 'ligne' | 'position' | 'global';
  description?: string;
}

export interface Formula {
  expression: string;
  isValid: boolean;
  error?: string;
  dependencies: string[];
  result?: number;
}

export interface FieldValue {
  value: number | Formula;
  isFormula: boolean;
}

export interface FormulaContext {
  lignes: Map<string, any>;
  positions: Map<string, any>;
  global: any;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  circularDependencies?: string[];
  missingReferences?: string[];
}