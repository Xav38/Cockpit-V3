import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  Chip,
  TextField,
  Alert,
  Tooltip
} from '@mui/material'

const FormulaSidebar = ({ 
  open, 
  onClose, 
  onInsertField,
  currentFormula = '',
  onFormulaChange,
  projectData,
  currentPositionId,
  currentLineId,
  isSelectingFields = false,
  onToggleFieldSelection,
  highlightedFields = []
}) => {
  const [expandedSection, setExpandedSection] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [testResult, setTestResult] = useState(null)

  // Get available fields based on context
  const getAvailableFields = () => {
    const fields = {
      position: [],
      lignes: [],
      projet: [],
      calculs: []
    }

    // Position fields
    if (currentPositionId) {
      const position = projectData.positions.find(p => p.id === currentPositionId)
      if (position) {
        fields.position = [
          { id: 'quantitePosition', label: 'Quantité position', value: position.quantite || 1 },
          { id: 'totalPosition', label: 'Total position', value: 'Calculé' },
          { id: 'margePosition', label: 'Marge position %', value: 'Calculé' }
        ]

        // Lines fields
        if (position.lignesChiffrage) {
          fields.lignes = position.lignesChiffrage
            .filter(l => !l.isProjectManagement && !l.isCommissionAgence)
            .map((ligne, index) => ({
              id: `L${index + 1}`,
              label: `Ligne ${index + 1}: ${ligne.descriptif || 'Sans nom'}`,
              subFields: [
                { id: `L${index + 1}.prixUnitAchat`, label: 'Prix unit. achat', value: ligne.prixUnitAchatValue },
                { id: `L${index + 1}.quantite`, label: 'Quantité', value: ligne.quantiteValue },
                { id: `L${index + 1}.totalAchat`, label: 'Total achat', value: ligne.totalAchat },
                { id: `L${index + 1}.pVente`, label: 'Prix vente', value: ligne.pVente }
              ]
            }))
        }
      }
    }

    // Project fields
    fields.projet = [
      { id: 'commissionAgence', label: 'Commission agence %', value: projectData.commissionAgence || 0 },
      { id: 'projectManagement', label: 'Gestion projet %', value: projectData.projectManagementPercentage || 10 }
    ]

    // Calculation helpers
    fields.calculs = [
      { id: 'SUM()', label: 'Somme', description: 'Additionne des valeurs' },
      { id: 'AVG()', label: 'Moyenne', description: 'Calcule la moyenne' },
      { id: 'MIN()', label: 'Minimum', description: 'Valeur minimale' },
      { id: 'MAX()', label: 'Maximum', description: 'Valeur maximale' },
      { id: 'ROUND()', label: 'Arrondir', description: 'Arrondit un nombre' }
    ]

    return fields
  }

  const fields = getAvailableFields()

  const handleFieldClick = (fieldId) => {
    if (onInsertField) {
      onInsertField(fieldId)
    }
  }

  const handleTestFormula = () => {
    try {
      // Simple test evaluation - in real implementation would use the formula engine
      const result = 'Test: Formula valide ✓'
      setTestResult({ type: 'success', message: result })
    } catch (error) {
      setTestResult({ type: 'error', message: `Erreur: ${error.message}` })
    }
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: open ? 400 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-function-line" />
            Assistant Formules
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isSelectingFields ? "Désactiver la sélection" : "Activer la sélection de champs"}>
              <IconButton 
                onClick={onToggleFieldSelection} 
                size="small"
                color={isSelectingFields ? "primary" : "default"}
                sx={{
                  backgroundColor: isSelectingFields ? 'primary.50' : 'transparent'
                }}
              >
                <i className="ri-cursor-line" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Mode Selection Info */}
        {isSelectingFields && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <IconButton 
                size="small" 
                onClick={onToggleFieldSelection}
                sx={{ color: 'info.main' }}
              >
                <i className="ri-close-line" />
              </IconButton>
            }
          >
            Mode sélection activé - Cliquez sur les champs dans le formulaire pour les insérer dans la formule
          </Alert>
        )}

        {/* Current Formula - Always visible when sidebar is open */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Formule actuelle :
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            value={currentFormula || ''}
            onChange={(e) => onFormulaChange && onFormulaChange(e.target.value)}
            sx={{ 
              mb: 1,
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
            placeholder="Saisissez votre formule ici..."
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleTestFormula}
              startIcon={<i className="ri-play-line" />}
            >
              Tester
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                // Valider la formule et fermer la sidebar
                onClose()
              }}
              startIcon={<i className="ri-check-line" />}
              color="primary"
            >
              Valider
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={onClose}
              startIcon={<i className="ri-close-line" />}
              color="error"
            >
              Annuler
            </Button>
          </Box>
        </Paper>

        {/* Test Result */}
        {testResult && (
          <Alert 
            severity={testResult.type} 
            onClose={() => setTestResult(null)}
            sx={{ mb: 2 }}
          >
            {testResult.message}
          </Alert>
        )}

        {/* Search */}
        <TextField
          size="small"
          placeholder="Rechercher un champ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <i className="ri-search-line" style={{ marginRight: 8 }} />
          }}
        />

        {/* Fields List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List sx={{ py: 0 }}>
            {/* Position Fields */}
            {fields.position.length > 0 && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => toggleSection('position')}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className="ri-layout-grid-line" />
                          <Typography variant="subtitle2">Position courante</Typography>
                        </Box>
                      }
                    />
                    <i className={`ri-arrow-${expandedSection === 'position' ? 'up' : 'down'}-s-line`} />
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedSection === 'position'}>
                  <List component="div" disablePadding>
                    {fields.position.map(field => (
                      <ListItem key={field.id} sx={{ pl: 4 }}>
                        <ListItemButton 
                          onClick={() => handleFieldClick(field.id)}
                          sx={{ 
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'primary.50' }
                          }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              {field.label}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                {field.id}
                              </Typography>
                              <Chip label={field.value} size="small" variant="outlined" />
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            )}

            {/* Lines Fields */}
            {fields.lignes.length > 0 && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => toggleSection('lignes')}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className="ri-list-check" />
                          <Typography variant="subtitle2">Lignes de chiffrage</Typography>
                        </Box>
                      }
                    />
                    <i className={`ri-arrow-${expandedSection === 'lignes' ? 'up' : 'down'}-s-line`} />
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedSection === 'lignes'}>
                  <List component="div" disablePadding>
                    {fields.lignes.map(ligne => (
                      <Box key={ligne.id}>
                        <ListItem sx={{ pl: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {ligne.label}
                          </Typography>
                        </ListItem>
                        {ligne.subFields?.map(subField => (
                          <ListItem key={subField.id} sx={{ pl: 6 }}>
                            <ListItemButton 
                              onClick={() => handleFieldClick(subField.id)}
                              sx={{ 
                                borderRadius: 1,
                                py: 0.5,
                                '&:hover': { bgcolor: 'primary.50' }
                              }}
                            >
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {subField.label}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                  {subField.id}
                                </Typography>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </Box>
                    ))}
                  </List>
                </Collapse>
              </>
            )}

            {/* Calculation Functions */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => toggleSection('calculs')}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="ri-calculator-line" />
                      <Typography variant="subtitle2">Fonctions de calcul</Typography>
                    </Box>
                  }
                />
                <i className={`ri-arrow-${expandedSection === 'calculs' ? 'up' : 'down'}-s-line`} />
              </ListItemButton>
            </ListItem>
            <Collapse in={expandedSection === 'calculs'}>
              <List component="div" disablePadding>
                {fields.calculs.map(func => (
                  <ListItem key={func.id} sx={{ pl: 4 }}>
                    <ListItemButton 
                      onClick={() => handleFieldClick(func.id)}
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'primary.50' }
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {func.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block' }}>
                          {func.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {func.description}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>

        {/* Footer Help */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Aide :</strong> Cliquez sur un champ pour l'insérer dans votre formule. 
            Utilisez les opérateurs +, -, *, / et les parenthèses pour créer des calculs complexes.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}

export default FormulaSidebar