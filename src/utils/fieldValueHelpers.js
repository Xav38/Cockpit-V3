// Utilitaires pour gérer les FieldValue similaires à quotator-demo

// Fonction pour extraire la valeur numérique d'un FieldValue
export function getNumericValue(fieldValue) {
  if (typeof fieldValue === 'number') {
    return fieldValue;
  }
  
  if (typeof fieldValue === 'object' && fieldValue?.isFormula) {
    const formula = fieldValue.value;
    return formula?.result ?? 0;
  }
  
  if (typeof fieldValue === 'object' && fieldValue?.value !== undefined) {
    return typeof fieldValue.value === 'number' ? fieldValue.value : 0;
  }
  
  return fieldValue || 0;
}

// Fonction pour créer un FieldValue simple (nombre)
export function createSimpleFieldValue(value) {
  return {
    value: typeof value === 'number' ? value : parseFloat(value) || 0,
    isFormula: false
  };
}

// Fonction pour créer un FieldValue avec formule
export function createFormulaFieldValue(formula) {
  return {
    value: formula,
    isFormula: true
  };
}

// Fonction pour vérifier si un FieldValue est une formule
export function isFormula(fieldValue) {
  return fieldValue?.isFormula && typeof fieldValue?.value === 'object';
}

// Fonction pour obtenir l'expression d'une formule
export function getFormulaExpression(fieldValue) {
  if (isFormula(fieldValue)) {
    return fieldValue.value.expression;
  }
  return null;
}

// Fonction pour mettre à jour un FieldValue
export function updateFieldValue(fieldValue, newValue, isFormula) {
  return {
    value: newValue,
    isFormula
  };
}