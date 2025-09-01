'use client'

// React Imports
import React from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepConnector from '@mui/material/StepConnector'
import { styled } from '@mui/material/styles'

// Custom StepConnector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${StepConnector.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${StepConnector.active}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundColor: theme.palette.primary.main,
    },
  },
  [`&.${StepConnector.completed}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundColor: theme.palette.success.main,
    },
  },
  [`& .${StepConnector.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}))

// Custom Step Icon
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.success.main,
  }),
  ...(ownerState.cancelled && {
    backgroundColor: theme.palette.error.main,
  }),
  ...(ownerState.finished && {
    backgroundColor: theme.palette.success.main,
  }),
  ...(ownerState.blocked && {
    backgroundColor: theme.palette.warning.main,
  }),
  ...(ownerState.new && {
    backgroundColor: theme.palette.info.main,
  }),
}))

function ColorlibStepIcon(props) {
  const { active, completed, className, cancelled, finished, blocked, new: isNew } = props

  const icons = {
    1: <i className="ri-file-text-line" />,
    2: <i className="ri-palette-line" />,
    3: <i className="ri-draft-line" />,
    4: <i className="ri-calculator-line" />,
    5: <i className="ri-check-line" />,
    6: <i className="ri-user-heart-line" />,
    7: <i className="ri-settings-line" />,
    8: <i className="ri-folder-line" />,
    9: <i className="ri-refresh-line" />,
  }

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active, cancelled, finished, blocked, new: isNew }} className={className}>
      {cancelled ? <i className="ri-close-line" /> : 
       finished ? <i className="ri-check-double-line" /> :
       blocked ? <i className="ri-error-warning-line" /> :
       isNew ? <i className="ri-add-circle-line" /> :
       icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  )
}

const WorkflowHeader = ({ currentStage, projectData, onStageClick }) => {
  
  // Fonction pour formatter une date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non définie'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  // Fonction pour récupérer la date d'une étape
  const getStepDate = (stepKey) => {
    if (!projectData) return null
    
    switch (stepKey) {
      case 'demande':
        return projectData.dateDemande || projectData.timeline?.dateDemande
      case 'maquette':
        return projectData.timeline?.maquette?.date
      case 'plans':
        return projectData.timeline?.plans?.date
      case 'chiffrage':
        return projectData.timeline?.chiffrage?.date
      case 'validation_chiffrage':
        return projectData.timeline?.validationChiffrage?.date
      case 'validation_client':
        return projectData.timeline?.validationClient?.date
      case 'gestion_projet':
        return projectData.timeline?.gestionProjet?.date
      case 'production':
        return projectData.timeline?.production?.date || projectData.timeline?.dossierProd?.date
      case 'rework':
        return projectData.timeline?.rework?.date
      default:
        return null
    }
  }
  // Définition des étapes du workflow
  const workflowSteps = [
    { 
      key: 'demande', 
      label: 'Demande', 
      icon: 1,
      description: 'Réception de la demande client' 
    },
    { 
      key: 'maquette', 
      label: 'Maquette', 
      icon: 2,
      description: 'Création de la maquette' 
    },
    { 
      key: 'plans', 
      label: 'Plans Techniques', 
      icon: 3,
      description: 'Élaboration des plans techniques' 
    },
    { 
      key: 'chiffrage', 
      label: 'Chiffrage', 
      icon: 4,
      description: 'Calcul des coûts et devis' 
    },
    { 
      key: 'validation_chiffrage', 
      label: 'Valid. Chiffrage', 
      icon: 5,
      description: 'Validation du chiffrage interne' 
    },
    { 
      key: 'validation_client', 
      label: 'Valid. Client', 
      icon: 6,
      description: 'Validation client' 
    },
    { 
      key: 'gestion_projet', 
      label: 'Gestion Projet', 
      icon: 7,
      description: 'Gestion et suivi de projet' 
    },
    { 
      key: 'production', 
      label: 'Production', 
      icon: 8,
      description: 'Dossier de production' 
    },
    { 
      key: 'rework', 
      label: 'Rework', 
      icon: 9,
      description: 'Reprise ou modifications' 
    }
  ]

  // Trouver l'index de l'étape courante
  const currentStepIndex = workflowSteps.findIndex(step => step.key === currentStage) || 0

  // Déterminer le statut de chaque étape
  const getStepStatus = (index) => {
    // Gérer les statuts spéciaux
    if (projectData?.status === 'annule') {
      return index === currentStepIndex ? 'cancelled' : (index < currentStepIndex ? 'completed' : 'pending')
    }
    if (projectData?.status === 'termine') {
      return index <= currentStepIndex ? 'finished' : 'pending'
    }
    if (projectData?.status === 'bloque') {
      return index === currentStepIndex ? 'blocked' : (index < currentStepIndex ? 'completed' : 'pending')
    }
    if (projectData?.status === 'nouveau') {
      return index === currentStepIndex ? 'new' : (index < currentStepIndex ? 'completed' : 'pending')
    }
    
    // Logique normale
    if (index < currentStepIndex) return 'completed'
    if (index === currentStepIndex) return 'active'
    return 'pending'
  }

  // Fonction pour gérer le clic sur une étape
  const handleStepClick = (stepKey, index) => {
    if (onStageClick && index <= currentStepIndex) {
      onStageClick(stepKey)
    }
  }

  return (
    <Box sx={{ 
      mb: 4, 
      p: 3, 
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
    }}>

      {/* Stepper de progression */}
      <Stepper 
        alternativeLabel 
        activeStep={currentStepIndex} 
        connector={<ColorlibConnector />}
        sx={{ 
          '& .MuiStepLabel-root': {
            cursor: 'pointer'
          },
          '& .MuiStepLabel-labelContainer': {
            mt: 1
          }
        }}
      >
        {workflowSteps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          return (
            <Step 
              key={step.key} 
              completed={stepStatus === 'completed' || stepStatus === 'finished'}
              active={stepStatus === 'active'}
              onClick={() => handleStepClick(step.key, index)}
            >
              <StepLabel 
                StepIconComponent={(props) => (
                  <ColorlibStepIcon 
                    {...props} 
                    cancelled={stepStatus === 'cancelled'}
                    finished={stepStatus === 'finished'}
                    blocked={stepStatus === 'blocked'}
                    new={stepStatus === 'new'}
                  />
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '&.MuiStepLabel-alternativeLabel': {
                      mt: 1
                    }
                  }
                }}
              >
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                {step.label}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                {formatDate(getStepDate(step.key))}
              </Typography>
            </StepLabel>
          </Step>
        )
        })}
      </Stepper>

      {/* Informations de progression */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          Progression: {currentStepIndex} / {workflowSteps.length - 1} étapes complétées
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 100, 
            height: 6, 
            backgroundColor: 'grey.300', 
            borderRadius: 3,
            overflow: 'hidden' 
          }}>
            <Box sx={{ 
              width: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #72E128 0%, #26C6F9 50%, #666CFF 100%)',
              transition: 'width 0.3s ease'
            }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {Math.round((currentStepIndex / (workflowSteps.length - 1)) * 100)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default WorkflowHeader