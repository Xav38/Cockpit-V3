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
  value,
  formula,
  onValueChange,
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
  const [showResult, setShowResult] = useState(false);
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const inputRef = useRef(null);

  // Valeur affichée : résultat par défaut, formule en édition
  const getDisplayValue = () => {
    if (isEditingFormula) {
      return formula ? `=${formula}` : value || '';
    }
    
    if (formula) {
      // Afficher le résultat calculé par défaut
      return parseFloat(value || 0).toFixed(2);
    }
    
    return value || '';
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      if (formula) {
        // Passer en mode édition de formule pour voir/modifier
        setIsEditingFormula(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        // Pas de formule, permettre l'édition normale
        setIsEditingFormula(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  const handleBlur = () => {
    if (isEditingFormula) {
      setIsEditingFormula(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Appuyer sur Entrée valide la formule et sort du mode édition
      const inputValue = e.target.value;
      
      // Si la valeur commence par =, traiter comme formule
      if (inputValue.startsWith('=')) {
        const formulaExpression = inputValue.slice(1);
        const result = evaluateSimpleFormula(formulaExpression);
        
        if (result !== null) {
          // Formule valide - sauvegarder la formule et le résultat
          onFormulaChange && onFormulaChange(formulaExpression);
          onValueChange && onValueChange(result);
        } else {
          // Formule invalide - garder juste la formule
          onFormulaChange && onFormulaChange(formulaExpression);
        }
      }
      
      setIsEditingFormula(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      // Échap annule les modifications
      setIsEditingFormula(false);
      inputRef.current?.blur();
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (isEditingFormula) {
      // En mode édition de formule
      if (inputValue.startsWith('=')) {
        onFormulaChange && onFormulaChange(inputValue.slice(1));
      } else {
        onFormulaChange && onFormulaChange(inputValue);
      }
    } else {
      // Mode normal
      if (inputValue.startsWith('=')) {
        onFormulaChange && onFormulaChange(inputValue.slice(1));
      } else {
        onValueChange && onValueChange(inputValue);
      }
    }
  };

  const handleFieldClick = (e) => {
    console.log('Field clicked:', { isSelectingFields, fieldPath, hasOnFieldClick: !!onFieldClick });
    if (isSelectingFields && fieldPath && onFieldClick) {
      e.preventDefault();
      e.stopPropagation();
      onFieldClick(fieldPath);
      return;
    }
    
    // Si on n'est pas en mode sélection, comportement normal
    if (!isSelectingFields && !isEditingFormula) {
      if (formula) {
        setIsEditingFormula(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
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
    } else if (formula) {
      // Champ avec formule - style discret
      styles = {
        ...styles,
        ...baseStyles,
        '& .MuiInputBase-root': {
          ...baseStyles['& .MuiInputBase-root'],
          fontFamily: isEditingFormula ? 'monospace' : 'inherit',
          color: formula && !isEditingFormula ? '#2e7d32' : 'inherit', // Vert pour les résultats de formule
          fontWeight: formula && !isEditingFormula ? 600 : 'inherit',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: formula ? '#ddd' : 'inherit',
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
        value={getDisplayValue()}
        onChange={handleChange}
        onDoubleClick={handleDoubleClick}
        onClick={handleFieldClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (formula && !showResult) {
            setIsEditingFormula(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        InputProps={{
          readOnly: false, // Ne jamais être readonly pour permettre les clics
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
                      color: formula ? 'orange' : 'inherit' 
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
      {formula && !isEditingFormula && (
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
      {formula && !isEditingFormula && (
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
          title={`Formule: =${formula}`}
          onClick={handleDoubleClick}
        >
          f(x)
        </Typography>
      )}
    </Box>
  );
};

export default EnhancedFormulaField;