import React, { useState, useRef, useEffect } from 'react';
import { TextField, IconButton, Tooltip, Box } from '@mui/material';
import { FieldValue, Formula, FormulaContext } from '../types/formula';
import { getNumericValue } from '../utils/fieldValueHelpers';
import { FormulaEngine } from '../utils/formulaEngine';

interface FormulaFieldProps {
  value: FieldValue;
  onChange: (value: number) => void;
  onOpenFormula: () => void;
  onFormulaChange?: (formula: string, isFormula: boolean) => void;
  placeholder?: string;
  className?: string;
  isSelectingFields?: boolean;
  fieldPath?: string;
  onFieldClick?: (fieldPath: string) => void;
  isHighlighted?: boolean;
  formulaEngine?: FormulaEngine;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

export const FormulaField: React.FC<FormulaFieldProps> = ({
  value,
  onChange,
  onOpenFormula,
  onFormulaChange,
  placeholder = "0",
  className = "",
  isSelectingFields = false,
  fieldPath,
  onFieldClick,
  isHighlighted = false,
  formulaEngine,
  size = 'small',
  fullWidth = false
}) => {
  const numericValue = getNumericValue(value);
  const isFormula = value.isFormula;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<number>(numericValue);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Recalculer la formule quand le formulaEngine change (contexte mis à jour)
  useEffect(() => {
    if (isFormula && typeof value.value === 'object' && formulaEngine) {
      const formula = value.value as Formula;
      try {
        const newResult = formulaEngine.evaluateExpression(formula.expression);
        if (!isNaN(newResult)) {
          setCalculatedValue(newResult);
        }
      } catch (error) {
        // Garder la valeur actuelle si l'évaluation échoue
        console.warn('Erreur lors du recalcul de formule:', error);
      }
    } else {
      setCalculatedValue(numericValue);
    }
  }, [formulaEngine, value, isFormula, numericValue]);
  
  // Valeur à afficher : résultat numérique en mode normal, formule en mode édition
  const getDisplayValue = () => {
    if (isEditing) {
      return editValue;
    }
    
    if (isFormula && typeof value.value === 'object') {
      // Afficher le résultat recalculé, pas la valeur mise en cache
      return calculatedValue.toFixed(2);
    }
    
    return calculatedValue.toFixed(2);
  };

  // Gérer le double-clic pour passer en mode édition
  const handleDoubleClick = () => {
    if (isSelectingFields) return;
    
    setIsEditing(true);
    if (isFormula && typeof value.value === 'object') {
      setEditValue('=' + value.value.expression);
    } else {
      setEditValue(numericValue.toString());
    }
    // Focus après le rendu
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Gérer la sortie du mode édition
  const handleBlur = () => {
    if (isEditing) {
      handleInputChange();
      setIsEditing(false);
    }
  };

  // Gérer les touches spéciales en mode édition
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputChange();
      setIsEditing(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue('');
    }
  };

  const handleInputChange = () => {
    const inputValue = editValue;
    
    if (inputValue.startsWith('=')) {
      // C'est une formule
      const expression = inputValue.slice(1);
      if (onFormulaChange) {
        onFormulaChange(expression, true);
      }
    } else {
      // C'est une valeur numérique
      const newValue = parseFloat(inputValue) || 0;
      onChange(newValue);
      if (onFormulaChange) {
        onFormulaChange(inputValue, false);
      }
    }
  };

  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleFieldClick = (e: React.MouseEvent) => {
    if (isSelectingFields && fieldPath && onFieldClick) {
      e.preventDefault();
      e.stopPropagation();
      onFieldClick(fieldPath);
    }
  };

  // Styles pour la mise en surbrillance
  const getFieldStyles = () => {
    if (isHighlighted) {
      return {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#e3f2fd',
          '& fieldset': {
            borderColor: '#2196f3',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: '#1976d2',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1565c0',
          },
        },
        cursor: isSelectingFields ? 'pointer' : 'default',
        boxShadow: isHighlighted ? '0 0 8px rgba(33, 150, 243, 0.3)' : 'none',
      };
    }
    
    if (isSelectingFields) {
      return {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff3e0',
          '& fieldset': {
            borderColor: '#ff9800',
            borderWidth: 2,
          },
          '&:hover': {
            backgroundColor: '#ffe0b2',
          },
        },
        cursor: 'pointer',
      };
    }
    
    if (isFormula) {
      return {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#f3e5f5',
          '& fieldset': {
            borderColor: '#9c27b0',
          },
        },
      };
    }
    
    return {};
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <TextField
        inputRef={inputRef}
        type="text"
        value={getDisplayValue()}
        onChange={handleEditValueChange}
        onDoubleClick={handleDoubleClick}
        onClick={handleFieldClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          readOnly: isSelectingFields || !isEditing,
          sx: {
            fontFamily: isFormula || isEditing ? 'monospace' : 'inherit',
            '& input': {
              textAlign: 'right',
            },
          },
        }}
        sx={{
          ...getFieldStyles(),
          mr: 1,
        }}
      />
      
      {/* Bouton de formule */}
      <Tooltip title="Ouvrir l'éditeur de formules">
        <IconButton
          size="small"
          onClick={onOpenFormula}
          sx={{
            width: 28,
            height: 28,
            backgroundColor: isFormula ? '#9c27b0' : '#f5f5f5',
            color: isFormula ? 'white' : '#666',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: isFormula ? '#7b1fa2' : '#e0e0e0',
            },
          }}
        >
          fx
        </IconButton>
      </Tooltip>
      
      {/* Indicateur de formule */}
      {isFormula && typeof value.value === 'object' && !isEditing && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            width: 0,
            height: 0,
            borderLeft: '6px solid #9c27b0',
            borderBottom: '6px solid transparent',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Tooltip avec la formule au survol */}
      {isFormula && typeof value.value === 'object' && !isEditing && (
        <Tooltip 
          title={`Formule: =${value.value.expression}`}
          placement="top"
          arrow
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0 }} />
        </Tooltip>
      )}
    </Box>
  );
};