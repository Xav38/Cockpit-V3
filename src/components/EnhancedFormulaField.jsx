import React, { useState, useRef } from 'react';
import { TextField, Typography, Box, IconButton } from '@mui/material';

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

  // Valeur affichée : formule par défaut, résultat si showResult activé, ou édition
  const getDisplayValue = () => {
    if (isEditingFormula) {
      return formula ? `=${formula}` : '';
    }
    
    if (formula) {
      if (showResult) {
        // Afficher le résultat calculé
        return parseFloat(value || 0).toFixed(2);
      } else {
        // Afficher la formule avec = par défaut
        return `=${formula}`;
      }
    }
    
    return value || '';
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      if (formula) {
        // Basculer entre formule et résultat
        setShowResult(!showResult);
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
    if (e.key === 'Enter' || e.key === 'Escape') {
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
          fontFamily: showResult ? 'inherit' : 'monospace',
          color: formula ? '#666' : 'inherit',
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
      
      {/* Affichage du résultat calculé ou formule selon le mode */}
      {formula && !isEditingFormula && (
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            top: -8, 
            right: endAdornment ? 80 : 8, 
            fontSize: '0.7rem', 
            color: showResult ? 'success.main' : 'secondary.main',
            bgcolor: 'background.paper',
            px: 0.5,
            borderRadius: 0.5,
            border: '1px solid',
            borderColor: showResult ? 'success.main' : 'secondary.main',
            cursor: 'pointer',
          }}
          title={showResult ? `Formule: ${formula}` : `Résultat: ${parseFloat(value || 0).toFixed(2)}`}
          onClick={() => setShowResult(!showResult)}
        >
          {showResult ? 'f(x)' : `= ${parseFloat(value || 0).toFixed(2)}`}
        </Typography>
      )}
    </Box>
  );
};

export default EnhancedFormulaField;