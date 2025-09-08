import React, { useState, useRef } from 'react';
import { TextField, Typography, Box, IconButton } from '@mui/material';

// Évaluateur simple de formules mathématiques
const evaluateSimpleFormula = (expression) => {
  try {
    // Nettoyer l'expression
    const cleaned = expression.replace(/\s+/g, '');
    
    // Vérifier que l'expression ne contient que des caractères autorisés
    const allowedPattern = /^[0-9+\-*/().\s]*$/;
    if (!allowedPattern.test(cleaned)) {
      return null;
    }

    // Utiliser Function constructor pour une évaluation sûre
    const func = new Function('return ' + cleaned);
    const result = func();
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null;
    }
    
    return result;
  } catch (error) {
    return null;
  }
};

const EnhancedFormulaField = ({
  value, // FieldValue: { value: number | Formula, isFormula: boolean }
  onChange,
  onFormulaChange,
  onOpenFormula,
  placeholder,
  disabled,
  size = "small",
  fullWidth = true,
  label,
  endAdornment,
  isSelectingFields = false,
  fieldPath,
  onFieldClick,
  isHighlighted = false,
  sx = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Fonction pour extraire la valeur numérique d'un FieldValue (copié de quotator-demo)
  const getNumericValue = (fieldValue) => {
    console.log('getNumericValue called with:', fieldValue);
    if (!fieldValue) {
      console.log('No fieldValue, returning 0');
      return 0;
    }
    if (typeof fieldValue === 'number') {
      console.log('fieldValue is number:', fieldValue);
      return fieldValue;
    }
    
    if (typeof fieldValue === 'object' && fieldValue.isFormula) {
      const formula = fieldValue.value;
      console.log('fieldValue is formula object:', formula);
      
      // FIX: Gérer la double imbrication
      // Si formula.expression existe et contient result, l'utiliser
      if (formula.expression && typeof formula.expression === 'object' && formula.expression.result !== undefined) {
        console.log('Using nested formula.expression.result:', formula.expression.result);
        return formula.expression.result;
      }
      
      // Sinon utiliser formula.result si disponible
      const result = formula.result ?? 0;
      console.log('formula result:', result);
      return result;
    }
    
    const result = fieldValue.value ?? 0;
    console.log('fieldValue.value:', result);
    return result;
  };

  // Extraire les valeurs du FieldValue
  console.log('🔍 Component received value:', JSON.stringify(value, null, 2));
  const isFormula = value?.isFormula || false;
  const numericValue = getNumericValue(value);
  const formulaExpression = (isFormula && typeof value.value === 'object') ? value.value.expression : '';
  console.log('🔍 Extracted formula expression:', formulaExpression);

  // Valeur affichée : résultat par défaut, formule en édition
  const getDisplayValue = () => {
    console.log('getDisplayValue - isEditing:', isEditing, 'editValue:', editValue, 'numericValue:', numericValue);
    if (isEditing) {
      return editValue;
    }
    
    // Utiliser la valeur numérique calculée
    const result = numericValue.toString();
    console.log('getDisplayValue returning:', result);
    return result;
  };

  const handleDoubleClick = () => {
    console.log('handleDoubleClick called - value:', value, 'isFormula:', isFormula);
    if (!disabled && !isSelectingFields) {
      setIsEditing(true);
      if (isFormula && typeof value.value === 'object') {
        // FIX: Gérer la double imbrication pour l'expression
        let expression;
        if (value.value.expression && typeof value.value.expression === 'object') {
          // Structure doublement imbriquée
          expression = '=' + value.value.expression.expression;
        } else if (typeof value.value.expression === 'string') {
          // Structure normale
          expression = '=' + value.value.expression;
        } else {
          expression = '0';
        }
        console.log('Setting editValue to formula:', expression);
        setEditValue(expression);
      } else {
        const numValue = numericValue.toString();
        console.log('Setting editValue to numeric:', numValue);
        setEditValue(numValue);
      }
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      handleInputChange();
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputChange();
      setIsEditing(false);
      // Ne pas déclencher blur qui appellerait handleInputChange à nouveau
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue('');
    }
  };

  const handleInputChange = () => {
    const inputValue = editValue;
    console.log('handleInputChange called with:', inputValue);
    
    if (inputValue.startsWith('=')) {
      // C'est une formule
      const expression = inputValue.slice(1);
      console.log('Formula processing with expression:', expression);
      
      if (onFormulaChange) {
        console.log('Calling onFormulaChange with:', expression, true);
        onFormulaChange(expression, true);
      }
    } else {
      // C'est une valeur numérique simple
      const newValue = parseFloat(inputValue) || 0;
      console.log('Number processing:', { inputValue, newValue });
      
      if (onChange) {
        console.log('Calling onChange with numeric value:', newValue);
        onChange(newValue);
      }
    }
  };

  const handleEditValueChange = (e) => {
    const newValue = e.target.value;
    
    if (isEditing) {
      // En mode édition, juste mettre à jour editValue
      setEditValue(newValue);
    } else {
      // Mode normal - entrer automatiquement en édition pour la saisie
      setIsEditing(true);
      setEditValue(newValue);
    }
  };

  const handleFieldClick = (e) => {
    if (isSelectingFields && fieldPath && onFieldClick) {
      e.preventDefault();
      e.stopPropagation();
      onFieldClick(fieldPath);
    }
    // Pas d'entrée automatique en édition sur clic simple
  };

  // Styles pour la mise en surbrillance
  const getFieldStyles = () => {
    let styles = { ...sx };
    
    // Styles de base identiques au reste du tableau
    const baseStyles = {
      '& .MuiInputBase-root': {
        fontSize: '0.875rem',
        backgroundColor: 'transparent', // Identique aux autres champs du tableau
      },
    };
    
    if (isHighlighted && isSelectingFields) {
      // Champ sélectionnable - juste un filet jaune
      styles = {
        ...styles,
        ...baseStyles,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#ffc107', // Jaune pour la sélection
            borderWidth: '2px',
            boxShadow: '0 0 0 1px #ffc107',
          },
          '&:hover fieldset': {
            borderColor: '#ff9800',
            borderWidth: '2px',
            boxShadow: '0 0 0 2px #ff9800',
          },
        },
        cursor: 'pointer',
      };
    } else if (isFormula) {
      // Champ avec formule - style discret
      styles = {
        ...styles,
        ...baseStyles,
        '& .MuiInputBase-root': {
          ...baseStyles['& .MuiInputBase-root'],
          fontFamily: isEditing ? 'monospace' : 'inherit',
          color: isFormula && !isEditing ? '#2e7d32' : 'inherit', // Vert pour les résultats de formule
          fontWeight: isFormula && !isEditing ? 600 : 'inherit',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isFormula ? '#ddd' : 'inherit',
          },
        },
      };
    } else {
      // Champ normal - style par défaut du tableau
      styles = {
        ...styles,
        ...baseStyles,
      };
    }
    
    return styles;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        inputRef={inputRef}
        size={size}
        fullWidth={fullWidth}
        label={label}
        type="text" // Forcer le type text pour permettre les formules
        value={getDisplayValue()}
        onChange={handleEditValueChange}
        onDoubleClick={handleDoubleClick}
        onClick={handleFieldClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        inputProps={{
          readOnly: isSelectingFields, // readOnly seulement en mode sélection
        }}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {onOpenFormula && (
                <IconButton
                  size="small"
                  onClick={() => onOpenFormula()}
                  sx={{ p: 0.5 }}
                  title="Assistant formules"
                >
                  <i 
                    className="ri-function-line" 
                    style={{ 
                      fontSize: '14px', 
                      color: isFormula ? 'orange' : 'inherit' 
                    }} 
                  />
                </IconButton>
              )}
              {endAdornment}
            </Box>
          )
        }}
        sx={getFieldStyles()}
      />
      
      {/* Indicateur triangle pour les formules */}
      {isFormula && !isEditing && (
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: -1,
            width: 0,
            height: 0,
            borderLeft: '8px solid #ffc107',
            borderBottom: '8px solid transparent',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Indicateur de formule */}
      {isFormula && !isEditing && (
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            top: -8, 
            right: endAdornment ? 80 : 8, 
            fontSize: '0.7rem', 
            color: 'secondary.main',
            bgcolor: 'background.paper',
            px: 0.5,
            borderRadius: 0.5,
            border: '1px solid',
            borderColor: 'secondary.main',
            cursor: 'pointer',
          }}
          title={`Formule: =${isFormula && typeof value.value === 'object' ? value.value.expression : ''}`}
          onClick={handleDoubleClick}
        >
          f(x)
        </Typography>
      )}
    </Box>
  );
};

export default EnhancedFormulaField;