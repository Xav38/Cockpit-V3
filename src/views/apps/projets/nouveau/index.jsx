'use client'

// React Imports
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'

// Component Imports
import WorkflowHeader from '@/components/WorkflowHeader'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import Tooltip from '@mui/material/Tooltip'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const NewProjectForm = () => {
  const router = useRouter()
  
  // États du formulaire
  const [projectData, setProjectData] = useState({
    numeroORE: '',
    etape: 'maquette',
    status: 'nouveau',
    nomClient: '',
    dateDemande: new Date().toISOString().split('T')[0],
    dateInstallation: '',
    vendeur: '',
    chiffreur: '',
    chefDeProjet: '',
    commissionAgence: '',
    concerne: '',
    description: '',
    importance: 1,
    tags: [],
    // Contacts
    adresseInstallation: '',
    contactSurPlace: {
      nom: '',
      poste: '',
      telephone: '',
      email: ''
    },
    contactClient: {
      nom: '',
      poste: '',
      telephone: '',
      email: ''
    },
    // Timeline stages
    timeline: {
      dateDemande: new Date().toISOString().split('T')[0],
      maquette: { date: '', imperatif: false, personnel: '' },
      plans: { date: '', imperatif: false, personnel: '' },
      chiffrage: { date: '', imperatif: false, personnel: '' },
      validationChiffrage: { date: '', imperatif: false, personnel: '' },
      validationClient: { date: '', imperatif: false, personnel: '' },
      gestionProjet: { date: '', imperatif: false, personnel: '' },
      dossierProd: { date: '', imperatif: false, personnel: '' },
      production: { date: '', imperatif: false, personnel: '' },
      rework: { date: '', imperatif: false, personnel: '' },
      prepress: { date: '', imperatif: false, personnel: '' },
      impression: { date: '', imperatif: false, personnel: '' },
      decoupe: { date: '', imperatif: false, personnel: '' },
      atelier: { date: '', imperatif: false, personnel: '' },
      atelierInf: { date: '', imperatif: false, personnel: '' },
      pose: { date: '', imperatif: false, personnel: '' }
    },
    // Positions et chiffrage - Position par défaut
    positions: [
      {
        id: 'pos_001',
        numero: '01',
        titre: '',
        titrePosition: '',
        quantite: 1,
        projectManagementPercentage: 10,
        showImages: false,
        showDocuments: false,
        showChiffrage: true,
        showProduction: false,
        images: [],
        documents: [],
        lignesChiffrage: [
          {
            id: 'line_001',
            descriptif: '',
            infos: '',
            prixUnitAchat: 0,
            prixUnitAchatFormula: null,
            quantite: 1,
            quantiteFormula: null,
            type: '',
            unite: 'pcs',
            totalAchat: 0,
            coeff: 1,
            pVente: 0,
            pUnitaire: 0,
            marge: 0,
            isProjectManagement: false,
            isCommissionAgence: false
          }
        ]
      }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [idCounter, setIdCounter] = useState(1)
  const [options, setOptions] = useState({
    statuts: [],
    users: [],
    etapes: []
  })

  // Expansion des sections
  const [expandedSections, setExpandedSections] = useState({
    informations: true,
    contacts: false,
    delais: false,
    positions: true
  })

  // Chargement des options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/options')
        if (response.ok) {
          const data = await response.json()
          setOptions(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des options:', error)
      }
    }
    fetchOptions()
  }, [])

  // Génération automatique du numéro ORE
  useEffect(() => {
    const generateORENumber = () => {
      const currentYear = new Date().getFullYear().toString().slice(-2)
      const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
      return `ORE-${currentYear}-${randomNum}`
    }
    
    if (!projectData.numeroORE) {
      setProjectData(prev => ({
        ...prev,
        numeroORE: generateORENumber(),
        timeline: {
          ...prev.timeline,
          dateDemande: prev.dateDemande
        }
      }))
    }
  }, [])

  // Client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Gestion automatique des lignes spéciales pour chaque position
  useEffect(() => {
    if (projectData.positions.length > 0) {
      let needsUpdate = false
      const updatedPositions = projectData.positions.map(position => {
        let updatedPosition = { ...position }
        
        // Vérifier et ajouter la ligne de gestion de projet
        const hasManagementLine = position.lignesChiffrage.some(line => line.isProjectManagement)
        const hasCommissionLine = position.lignesChiffrage.some(line => line.isCommissionAgence)
        
        if (!hasManagementLine || !hasCommissionLine) {
          needsUpdate = true
          
          // Séparer les lignes régulières et spéciales
          const regularLines = position.lignesChiffrage.filter(
            line => !line.isProjectManagement && !line.isCommissionAgence
          )
          const specialLines = []
          
          // Calculer le total des lignes régulières
          const regularTotal = regularLines.reduce((sum, line) => sum + (line.pVente || 0), 0)
          
          // Ajouter ou mettre à jour la ligne de gestion de projet
          if (!hasManagementLine && regularLines.length > 0) {
            const managementAmount = regularTotal * (position.projectManagementPercentage / 100)
            specialLines.push({
              id: generateId(),
              descriptif: 'Gestion de projet',
              infos: `${position.projectManagementPercentage}% du sous-total`,
              prixUnitAchat: managementAmount,
              prixUnitAchatFormula: null,
              quantite: 1,
              quantiteFormula: null,
              type: 'Gestion',
              unite: 'forfait',
              totalAchat: managementAmount,
              coeff: 1,
              pVente: managementAmount,
              pUnitaire: managementAmount,
              marge: 0,
              isProjectManagement: true,
              isCommissionAgence: false
            })
          } else if (hasManagementLine) {
            const existingManagement = position.lignesChiffrage.find(line => line.isProjectManagement)
            if (existingManagement) {
              const managementAmount = regularTotal * (position.projectManagementPercentage / 100)
              specialLines.push({
                ...existingManagement,
                prixUnitAchat: managementAmount,
                totalAchat: managementAmount,
                pVente: managementAmount,
                pUnitaire: managementAmount,
                infos: `${position.projectManagementPercentage}% du sous-total`
              })
            }
          }
          
          // Ajouter ou mettre à jour la ligne de commission d'agence
          if (!hasCommissionLine && projectData.commissionAgence && regularLines.length > 0) {
            const subtotal = regularTotal + (specialLines.find(l => l.isProjectManagement)?.pVente || 0)
            const commissionAmount = subtotal * 0.15
            specialLines.push({
              id: generateId(),
              descriptif: 'Commission d\'agence',
              infos: '15% du total',
              prixUnitAchat: commissionAmount,
              prixUnitAchatFormula: null,
              quantite: 1,
              quantiteFormula: null,
              type: 'Commission',
              unite: 'forfait',
              totalAchat: commissionAmount,
              coeff: 1,
              pVente: commissionAmount,
              pUnitaire: commissionAmount,
              marge: 0,
              isProjectManagement: false,
              isCommissionAgence: true
            })
          } else if (hasCommissionLine && projectData.commissionAgence) {
            const existingCommission = position.lignesChiffrage.find(line => line.isCommissionAgence)
            if (existingCommission) {
              const subtotal = regularTotal + (specialLines.find(l => l.isProjectManagement)?.pVente || 0)
              const commissionAmount = subtotal * 0.15
              specialLines.push({
                ...existingCommission,
                prixUnitAchat: commissionAmount,
                totalAchat: commissionAmount,
                pVente: commissionAmount,
                pUnitaire: commissionAmount
              })
            }
          }
          
          // Reconstruire les lignes avec les lignes spéciales à la fin
          updatedPosition.lignesChiffrage = [...regularLines, ...specialLines]
        }
        
        return updatedPosition
      })
      
      if (needsUpdate) {
        setProjectData(prev => ({
          ...prev,
          positions: updatedPositions
        }))
      }
    }
  }, [projectData.positions.length, projectData.commissionAgence]) // Re-run si le nombre de positions ou la commission change

  // Utility functions
  const generateId = () => {
    const id = `id_${idCounter}`
    setIdCounter(prev => prev + 1)
    return id
  }

  // Calculation functions
  const calculateLineTotals = (line) => {
    const totalAchat = (line.prixUnitAchat || 0) * (line.quantite || 0)
    const pVente = totalAchat * (line.coeff || 1)
    const pUnitaire = line.quantite > 0 ? pVente / line.quantite : 0
    const marge = pVente > 0 ? ((pVente - totalAchat) / pVente) * 100 : 0
    
    return { totalAchat, pVente, pUnitaire, marge }
  }

  const calculatePositionTotals = (position) => {
    let totalAchat = 0
    let totalVente = 0
    
    position.lignesChiffrage.forEach(ligne => {
      totalAchat += ligne.totalAchat || 0
      totalVente += ligne.pVente || 0
    })
    
    const marge = totalVente > 0 ? ((totalVente - totalAchat) / totalVente) * 100 : 0
    const tva = totalVente * 0.081 // 8.1% TVA suisse
    const totalTTC = totalVente + tva
    
    return { totalAchat, totalVente, marge, tva, totalTTC }
  }

  const calculateProjectTotals = () => {
    let totalAchatProject = 0
    let totalVenteProject = 0
    
    projectData.positions.forEach(position => {
      const totals = calculatePositionTotals(position)
      totalAchatProject += totals.totalAchat
      totalVenteProject += totals.totalVente
    })
    
    const margeProject = totalVenteProject > 0 ? ((totalVenteProject - totalAchatProject) / totalVenteProject) * 100 : 0
    const tvaProject = totalVenteProject * 0.081
    const totalTTCProject = totalVenteProject + tvaProject
    
    return { 
      totalAchatProject, 
      totalVenteProject, 
      margeProject, 
      tvaProject, 
      totalTTCProject 
    }
  }

  const handleInputChange = (field, value) => {
    setProjectData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Auto-update status based on stage changes
      if (field === 'etape' && prev.status === 'nouveau' && value !== 'demande') {
        newData.status = 'en_cours'
      }
      
      return newData
    })
  }

  const handleNestedInputChange = (section, field, value) => {
    setProjectData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleTimelineChange = (stage, field, value) => {
    setProjectData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        [stage]: typeof prev.timeline[stage] === 'object' 
          ? { ...prev.timeline[stage], [field]: value }
          : value
      }
    }))
  }

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleTagAdd = (newTag) => {
    if (newTag && !projectData.tags.includes(newTag)) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Fonction chiffrage principale
  const handleChiffrage = () => {
    // Passer à l'étape chiffrage
    setProjectData(prev => ({
      ...prev,
      etape: 'chiffrage',
      status: 'en_cours'
    }))
    
    // Ouvrir la section positions si elle est fermée
    if (!expandedSections.positions) {
      setExpandedSections(prev => ({
        ...prev,
        positions: true
      }))
    }
    
    // S'assurer qu'il y a au moins une position avec les lignes spéciales
    if (projectData.positions.length === 0) {
      addPosition()
    }
    
    // Scroll vers la section chiffrage
    setTimeout(() => {
      const positionsSection = document.querySelector('[data-section="positions"]')
      if (positionsSection) {
        positionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Special lines management
  const addProjectManagementLine = (positionId) => {
    const position = projectData.positions.find(p => p.id === positionId)
    if (!position) return

    // Calculate 10% of regular lines total
    const regularTotal = position.lignesChiffrage
      .filter(line => !line.isProjectManagement && !line.isCommissionAgence)
      .reduce((sum, line) => sum + (line.pVente || 0), 0)

    const managementAmount = regularTotal * (position.projectManagementPercentage / 100)

    const managementLine = {
      id: generateId(),
      descriptif: 'Gestion de projet',
      infos: `${position.projectManagementPercentage}% du sous-total`,
      prixUnitAchat: managementAmount,
      quantite: 1,
      type: 'Gestion',
      unite: 'forfait',
      totalAchat: managementAmount,
      coeff: 1,
      pVente: managementAmount,
      pUnitaire: managementAmount,
      marge: 0,
      isProjectManagement: true,
      isCommissionAgence: false
    }

    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos =>
        pos.id === positionId
          ? {
              ...pos,
              lignesChiffrage: [
                ...pos.lignesChiffrage.filter(line => !line.isProjectManagement),
                managementLine
              ]
            }
          : pos
      )
    }))
  }

  const addCommissionLine = (positionId) => {
    const position = projectData.positions.find(p => p.id === positionId)
    if (!position) return

    // Calculate 15% of subtotal (regular + management)
    const subtotal = position.lignesChiffrage
      .filter(line => !line.isCommissionAgence)
      .reduce((sum, line) => sum + (line.pVente || 0), 0)

    const commissionAmount = subtotal * 0.15

    const commissionLine = {
      id: generateId(),
      descriptif: "Commission d'agence",
      infos: '15% du sous-total',
      prixUnitAchat: commissionAmount,
      quantite: 1,
      type: 'Commission',
      unite: 'forfait',
      totalAchat: commissionAmount,
      coeff: 1,
      pVente: commissionAmount,
      pUnitaire: commissionAmount,
      marge: 0,
      isProjectManagement: false,
      isCommissionAgence: true
    }

    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos =>
        pos.id === positionId
          ? {
              ...pos,
              lignesChiffrage: [
                ...pos.lignesChiffrage.filter(line => !line.isCommissionAgence),
                commissionLine
              ]
            }
          : pos
      )
    }))
  }

  // Position management functions
  const addPosition = () => {
    const newPosition = {
      id: generateId(),
      numero: String(projectData.positions.length + 1).padStart(2, '0'),
      titre: '',
      titrePosition: '',
      quantite: 1,
      projectManagementPercentage: 10,
      showImages: false,
      showDocuments: false,
      showChiffrage: true,
      showProduction: false,
      images: [],
      documents: [],
      lignesChiffrage: [
        {
          id: generateId(),
          descriptif: '',
          infos: '',
          prixUnitAchat: 0,
          quantite: 1,
          type: '',
          unite: 'pcs',
          totalAchat: 0,
          coeff: 1,
          pVente: 0,
          pUnitaire: 0,
          marge: 0,
          isProjectManagement: false,
          isCommissionAgence: false
        }
      ]
    }
    setProjectData(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition]
    }))
  }

  const updatePosition = (positionId, field, value) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos =>
        pos.id === positionId ? { ...pos, [field]: value } : pos
      )
    }))
  }

  const deletePosition = (positionId) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos.id !== positionId)
    }))
  }

  const duplicatePosition = (positionId) => {
    const position = projectData.positions.find(p => p.id === positionId)
    if (position) {
      const newPosition = {
        ...position,
        id: generateId(),
        numero: String(projectData.positions.length + 1).padStart(2, '0'),
        lignesChiffrage: position.lignesChiffrage.map(ligne => ({
          ...ligne,
          id: generateId()
        })),
        images: [...(position.images || [])],
        documents: [...(position.documents || [])]
      }
      setProjectData(prev => ({
        ...prev,
        positions: [...prev.positions, newPosition]
      }))
    }
  }

  // Quote line management functions
  const addQuoteLine = (positionId) => {
    const newLine = {
      id: generateId(),
      descriptif: '',
      infos: '',
      prixUnitAchat: 0,
      prixUnitAchatFormula: null,
      quantite: 1,
      quantiteFormula: null,
      type: '',
      unite: 'pcs',
      totalAchat: 0,
      coeff: 1,
      pVente: 0,
      pUnitaire: 0,
      marge: 0,
      isProjectManagement: false,
      isCommissionAgence: false
    }
    
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => {
        if (pos.id === positionId) {
          // Séparer les lignes régulières des lignes spéciales
          const regularLines = pos.lignesChiffrage.filter(line => 
            !line.isProjectManagement && !line.isCommissionAgence
          )
          const specialLines = pos.lignesChiffrage.filter(line => 
            line.isProjectManagement || line.isCommissionAgence
          )

          // Recalculer les lignes spéciales après ajout d'une ligne régulière
          let updatedSpecialLines = [...specialLines]

          // Mettre à jour la ligne de gestion de projet si elle existe
          const managementLineIndex = updatedSpecialLines.findIndex(line => line.isProjectManagement)
          if (managementLineIndex !== -1) {
            const regularTotal = [...regularLines, newLine].reduce((sum, line) => sum + (line.pVente || 0), 0)
            const managementAmount = regularTotal * (pos.projectManagementPercentage / 100)
            
            updatedSpecialLines[managementLineIndex] = {
              ...updatedSpecialLines[managementLineIndex],
              prixUnitAchat: managementAmount,
              totalAchat: managementAmount,
              pVente: managementAmount,
              pUnitaire: managementAmount
            }
          }

          // Mettre à jour la ligne de commission si elle existe
          const commissionLineIndex = updatedSpecialLines.findIndex(line => line.isCommissionAgence)
          if (commissionLineIndex !== -1) {
            const subtotalWithManagement = [...regularLines, newLine].reduce((sum, line) => sum + (line.pVente || 0), 0) +
              (updatedSpecialLines.find(line => line.isProjectManagement)?.pVente || 0)
            const commissionAmount = subtotalWithManagement * 0.15
            
            updatedSpecialLines[commissionLineIndex] = {
              ...updatedSpecialLines[commissionLineIndex],
              prixUnitAchat: commissionAmount,
              totalAchat: commissionAmount,
              pVente: commissionAmount,
              pUnitaire: commissionAmount
            }
          }

          return {
            ...pos,
            lignesChiffrage: [...regularLines, newLine, ...updatedSpecialLines]
          }
        }
        return pos
      })
    }))
  }

  // Fonction pour évaluer les formules
  const evaluateFormula = (formula, position, line) => {
    if (!formula || typeof formula !== 'string') return 0

    try {
      // Si c'est juste un nombre, le retourner directement
      const numValue = parseFloat(formula)
      if (!isNaN(numValue)) return numValue

      // Remplacer les variables par leurs valeurs
      let processedFormula = formula
      
      // Variables disponibles:
      // - quantitePosition: quantité de la position
      // - autres lignes: L1, L2, etc. pour référencer d'autres lignes
      processedFormula = processedFormula.replace(/quantitePosition/g, position.quantite || 1)
      
      // Référencer d'autres lignes de la même position
      const lines = position.lignesChiffrage
      lines.forEach((l, index) => {
        if (l.id !== line.id) {
          const lineRef = `L${index + 1}`
          processedFormula = processedFormula.replace(
            new RegExp(lineRef + '\\.prixUnitAchat', 'g'), 
            l.prixUnitAchat || 0
          )
          processedFormula = processedFormula.replace(
            new RegExp(lineRef + '\\.quantite', 'g'), 
            l.quantite || 0
          )
          processedFormula = processedFormula.replace(
            new RegExp(lineRef + '\\.totalAchat', 'g'), 
            l.totalAchat || 0
          )
        }
      })

      // Évaluer la formule (seulement les opérations mathématiques de base)
      const result = Function(`"use strict"; return (${processedFormula})`)()
      return isNaN(result) ? 0 : result
    } catch (error) {
      console.warn('Erreur dans la formule:', formula, error)
      return 0
    }
  }

  const updateQuoteLine = (positionId, lineId, field, value) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => {
        if (pos.id === positionId) {
          const updatedPosition = {
            ...pos,
            lignesChiffrage: pos.lignesChiffrage.map(ligne => {
              if (ligne.id === lineId) {
                const updatedLine = { ...ligne }
                
                // Pour les champs qui peuvent contenir des formules
                if (field === 'prixUnitAchatFormula') {
                  updatedLine.prixUnitAchatFormula = value
                  updatedLine.prixUnitAchat = evaluateFormula(value, pos, ligne)
                } else if (field === 'quantiteFormula') {
                  updatedLine.quantiteFormula = value
                  updatedLine.quantite = evaluateFormula(value, pos, ligne)
                } else {
                  updatedLine[field] = value
                }
                
                // Recalculate totals when relevant fields change
                if (['prixUnitAchat', 'quantite', 'coeff', 'prixUnitAchatFormula', 'quantiteFormula'].includes(field)) {
                  const totals = calculateLineTotals(updatedLine)
                  updatedLine.totalAchat = totals.totalAchat
                  updatedLine.pVente = totals.pVente
                  updatedLine.pUnitaire = totals.pUnitaire
                  updatedLine.marge = totals.marge
                }
                
                return updatedLine
              }
              return ligne
            })
          }

          // Recalculate and update special lines after regular line changes
          if (['prixUnitAchat', 'quantite', 'coeff', 'prixUnitAchatFormula', 'quantiteFormula'].includes(field)) {
            // Calculer le total des lignes régulières
            const regularTotal = updatedPosition.lignesChiffrage
              .filter(line => !line.isProjectManagement && !line.isCommissionAgence)
              .reduce((sum, line) => sum + (line.pVente || 0), 0)
            
            // Update project management line if it exists
            const managementLineIndex = updatedPosition.lignesChiffrage.findIndex(line => line.isProjectManagement)
            if (managementLineIndex !== -1) {
              const managementAmount = regularTotal * (updatedPosition.projectManagementPercentage / 100)
              
              updatedPosition.lignesChiffrage[managementLineIndex] = {
                ...updatedPosition.lignesChiffrage[managementLineIndex],
                infos: `${updatedPosition.projectManagementPercentage}% du sous-total`,
                prixUnitAchat: managementAmount,
                totalAchat: managementAmount,
                pVente: managementAmount,
                pUnitaire: managementAmount
              }
            }

            // Update commission line if it exists
            const commissionLineIndex = updatedPosition.lignesChiffrage.findIndex(line => line.isCommissionAgence)
            if (commissionLineIndex !== -1) {
              // La commission s'applique sur le total incluant la gestion de projet
              const managementLine = updatedPosition.lignesChiffrage[managementLineIndex]
              const subtotal = regularTotal + (managementLine?.pVente || 0)
              const commissionAmount = subtotal * 0.15
              
              updatedPosition.lignesChiffrage[commissionLineIndex] = {
                ...updatedPosition.lignesChiffrage[commissionLineIndex],
                infos: '15% du total',
                prixUnitAchat: commissionAmount,
                totalAchat: commissionAmount,
                pVente: commissionAmount,
                pUnitaire: commissionAmount
              }
            }
          }

          return updatedPosition
        }
        return pos
      })
    }))
  }

  const deleteQuoteLine = (positionId, lineId) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => {
        if (pos.id === positionId) {
          // Filtrer la ligne à supprimer
          const remainingLines = pos.lignesChiffrage.filter(ligne => ligne.id !== lineId)
          
          // Séparer les lignes régulières des lignes spéciales
          const regularLines = remainingLines.filter(line => 
            !line.isProjectManagement && !line.isCommissionAgence
          )
          const specialLines = remainingLines.filter(line => 
            line.isProjectManagement || line.isCommissionAgence
          )

          // Recalculer les lignes spéciales après suppression
          let updatedSpecialLines = [...specialLines]

          // Mettre à jour la ligne de gestion de projet si elle existe
          const managementLineIndex = updatedSpecialLines.findIndex(line => line.isProjectManagement)
          if (managementLineIndex !== -1) {
            const regularTotal = regularLines.reduce((sum, line) => sum + (line.pVente || 0), 0)
            const managementAmount = regularTotal * (pos.projectManagementPercentage / 100)
            
            updatedSpecialLines[managementLineIndex] = {
              ...updatedSpecialLines[managementLineIndex],
              infos: `${pos.projectManagementPercentage}% du sous-total`,
              prixUnitAchat: managementAmount,
              totalAchat: managementAmount,
              pVente: managementAmount,
              pUnitaire: managementAmount
            }
          }

          // Mettre à jour la ligne de commission si elle existe
          const commissionLineIndex = updatedSpecialLines.findIndex(line => line.isCommissionAgence)
          if (commissionLineIndex !== -1) {
            const subtotalWithManagement = regularLines.reduce((sum, line) => sum + (line.pVente || 0), 0) +
              (updatedSpecialLines.find(line => line.isProjectManagement)?.pVente || 0)
            const commissionAmount = subtotalWithManagement * 0.15
            
            updatedSpecialLines[commissionLineIndex] = {
              ...updatedSpecialLines[commissionLineIndex],
              infos: '15% du total',
              prixUnitAchat: commissionAmount,
              totalAchat: commissionAmount,
              pVente: commissionAmount,
              pUnitaire: commissionAmount
            }
          }

          return {
            ...pos,
            lignesChiffrage: [...regularLines, ...updatedSpecialLines]
          }
        }
        return pos
      })
    }))
  }

  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEndQuoteLines = (event, positionId) => {
    const { active, over } = event
    
    if (!over) return
    
    const position = projectData.positions.find(p => p.id === positionId)
    if (!position) return
    
    const oldIndex = position.lignesChiffrage.findIndex(line => line.id === active.id)
    const newIndex = position.lignesChiffrage.findIndex(line => line.id === over.id)
    
    if (oldIndex === newIndex) return
    
    // Separate regular lines from special lines
    const regularLines = position.lignesChiffrage.filter(line => 
      !line.isProjectManagement && !line.isCommissionAgence
    )
    const specialLines = position.lignesChiffrage.filter(line => 
      line.isProjectManagement || line.isCommissionAgence
    )
    
    // Only allow reordering within regular lines
    const draggedLine = position.lignesChiffrage[oldIndex]
    if (draggedLine.isProjectManagement || draggedLine.isCommissionAgence) {
      return // Don't allow dragging special lines
    }
    
    const regularOldIndex = regularLines.findIndex(line => line.id === active.id)
    const regularNewIndex = regularLines.findIndex(line => line.id === over.id)
    
    if (regularOldIndex !== -1 && regularNewIndex !== -1) {
      const reorderedRegularLines = arrayMove(regularLines, regularOldIndex, regularNewIndex)
      const newLines = [...reorderedRegularLines, ...specialLines]
      
      updatePosition(positionId, 'lignesChiffrage', newLines)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        router.push('/apps/projets/list')
      } else {
        console.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      nouveau: 'info',
      en_cours: 'primary',
      termine: 'success',
      annule: 'error',
      bloque: 'warning'
    }
    return colors[status] || 'info'
  }

  // File upload functions
  const handleFileUpload = (event, positionId, fileType) => {
    const files = Array.from(event.target.files)
    const maxSize = fileType === 'images' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for documents
    
    files.forEach(file => {
      if (file.size > maxSize) {
        alert(`Le fichier ${file.name} est trop volumineux. Taille maximale: ${fileType === 'images' ? '5MB' : '10MB'}`)
        return
      }

      // Create file URL for preview
      const fileUrl = URL.createObjectURL(file)
      
      const fileData = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        file: file // Keep the original file for potential upload
      }

      setProjectData(prev => ({
        ...prev,
        positions: prev.positions.map(pos => 
          pos.id === positionId ? {
            ...pos,
            [fileType]: [...(pos[fileType] || []), fileData]
          } : pos
        )
      }))
    })
  }

  const removeFile = (positionId, fileType, fileIndex) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => 
        pos.id === positionId ? {
          ...pos,
          [fileType]: pos[fileType]?.filter((_, index) => index !== fileIndex) || []
        } : pos
      )
    }))
  }

  // Position Summary Component
  const PositionSummary = ({ position }) => {
    const totals = calculatePositionTotals(position)

    return (
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: 'background.default', 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Récapitulatif de la position
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Total Achat
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {totals.totalAchat.toFixed(2)} CHF
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Prix Vente HT
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                {totals.totalVente.toFixed(2)} CHF
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Marge
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: totals.marge >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {totals.marge.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Prix TTC
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {totals.totalTTC.toFixed(2)} CHF
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Project Financial Summary Component
  const ProjectFinancialSummary = ({ positions }) => {
    const projectTotals = calculateProjectTotals()

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Récapitulatif Financier Global
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Coûts
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Achat:</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {projectTotals.totalAchatProject.toFixed(2)} CHF
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                Revenus
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Prix Vente HT:</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {projectTotals.totalVenteProject.toFixed(2)} CHF
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>TVA (8.1%):</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {projectTotals.tvaProject.toFixed(2)} CHF
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>Prix Total TTC:</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {projectTotals.totalTTCProject.toFixed(2)} CHF
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Marge Globale:
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: projectTotals.margeProject >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {projectTotals.margeProject.toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Bénéfice: {(projectTotals.totalVenteProject - projectTotals.totalAchatProject).toFixed(2)} CHF
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Composant pour les lignes de chiffrage avec drag and drop
  const SortableQuoteLine = ({ line, position, onUpdateLine, onDeleteLine, onAddLine }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: line.id,
      disabled: line.isProjectManagement || line.isCommissionAgence
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const isSpecialLine = line.isProjectManagement || line.isCommissionAgence
    const unites = ['pcs', 'm²', 'm', 'kg', 'h', 'lot', 'forfait']

    return (
      <TableRow 
        ref={setNodeRef} 
        style={style} 
        key={line.id} 
        sx={{ 
          '& .drag-handle': {
            cursor: isSpecialLine ? 'not-allowed' : 'grab',
            opacity: isSpecialLine ? 0.3 : 1
          }
        }}
      >
        <TableCell sx={{ width: '30px', p: 1 }}>
          <Box 
            className="drag-handle" 
            {...attributes} 
            {...listeners}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px'
            }}
          >
            <i className="ri-drag-move-2-line text-sm" />
          </Box>
        </TableCell>

        <TableCell sx={{ minWidth: 150 }}>
          <TextField
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Description"
            value={line.descriptif}
            onChange={(e) => onUpdateLine(position.id, line.id, 'descriptif', e.target.value)}
            disabled={isSpecialLine}
            sx={{ 
              '& .MuiInputBase-root': { 
                fontSize: '0.875rem'
              } 
            }}
          />
        </TableCell>

        <TableCell sx={{ minWidth: 120 }}>
          <TextField
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Infos complémentaires"
            value={line.infos}
            onChange={(e) => onUpdateLine(position.id, line.id, 'infos', e.target.value)}
            disabled={isSpecialLine}
            sx={{ 
              '& .MuiInputBase-root': { 
                fontSize: '0.875rem'
              } 
            }}
          />
        </TableCell>

        <TableCell sx={{ minWidth: 140 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="0.00 ou formule (ex: L1.totalAchat*0.1)"
              value={line.prixUnitAchatFormula || line.prixUnitAchat || ''}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || !isNaN(parseFloat(value))) {
                  // Si c'est un nombre simple
                  onUpdateLine(position.id, line.id, 'prixUnitAchat', parseFloat(value) || 0)
                } else {
                  // Si c'est une formule
                  onUpdateLine(position.id, line.id, 'prixUnitAchatFormula', value)
                }
              }}
              disabled={isSpecialLine}
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {line.prixUnitAchatFormula && (
                      <Tooltip title="Formule active">
                        <i className="ri-function-line" style={{ fontSize: '14px', color: 'orange' }} />
                      </Tooltip>
                    )}
                    <Typography variant="caption" sx={{ ml: 1 }}>CHF</Typography>
                  </Box>
                )
              }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.875rem',
                  borderColor: line.prixUnitAchatFormula ? 'warning.main' : 'inherit'
                } 
              }}
            />
            {line.prixUnitAchatFormula && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: -8, 
                  right: 8, 
                  fontSize: '0.7rem', 
                  color: 'warning.main',
                  bgcolor: 'background.paper',
                  px: 0.5
                }}
              >
                = {line.prixUnitAchat?.toFixed(2)} CHF
              </Typography>
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ minWidth: 120 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="1 ou formule (ex: quantitePosition*2)"
              value={line.quantiteFormula || line.quantite || ''}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || !isNaN(parseFloat(value))) {
                  // Si c'est un nombre simple
                  onUpdateLine(position.id, line.id, 'quantite', parseFloat(value) || 0)
                } else {
                  // Si c'est une formule
                  onUpdateLine(position.id, line.id, 'quantiteFormula', value)
                }
              }}
              disabled={isSpecialLine}
              InputProps={{
                endAdornment: line.quantiteFormula && (
                  <Tooltip title="Formule active">
                    <i className="ri-function-line" style={{ fontSize: '14px', color: 'orange' }} />
                  </Tooltip>
                )
              }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.875rem',
                  borderColor: line.quantiteFormula ? 'warning.main' : 'inherit'
                } 
              }}
            />
            {line.quantiteFormula && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: -8, 
                  right: 8, 
                  fontSize: '0.7rem', 
                  color: 'warning.main',
                  bgcolor: 'background.paper',
                  px: 0.5
                }}
              >
                = {line.quantite?.toFixed(2)}
              </Typography>
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ minWidth: 80 }}>
          <FormControl size="small" fullWidth disabled={isSpecialLine}>
            <Select
              value={line.unite}
              onChange={(e) => onUpdateLine(position.id, line.id, 'unite', e.target.value)}
              sx={{ 
                fontSize: '0.875rem'
              }}
            >
              {unites.map(unite => (
                <MenuItem key={unite} value={unite} sx={{ fontSize: '0.875rem' }}>
                  {unite}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>

        <TableCell sx={{ minWidth: 100 }}>
          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 500 }}>
            {line.totalAchat.toFixed(2)} CHF
          </Typography>
        </TableCell>

        <TableCell sx={{ minWidth: 80 }}>
          <TextField
            size="small"
            fullWidth
            type="number"
            placeholder="1.0"
            value={line.coeff}
            onChange={(e) => onUpdateLine(position.id, line.id, 'coeff', parseFloat(e.target.value) || 1)}
            disabled={isSpecialLine}
            InputProps={{
              inputProps: { step: 0.1, min: 0 }
            }}
            sx={{ 
              '& .MuiInputBase-root': { 
                fontSize: '0.875rem'
              } 
            }}
          />
        </TableCell>

        <TableCell sx={{ minWidth: 100 }}>
          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600, color: 'success.main' }}>
            {line.pVente.toFixed(2)} CHF
          </Typography>
        </TableCell>

        <TableCell sx={{ minWidth: 100 }}>
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {line.pUnitaire.toFixed(2)} CHF
          </Typography>
        </TableCell>

        <TableCell sx={{ minWidth: 80 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'right',
              color: line.marge >= 0 ? 'success.main' : 'error.main',
              fontWeight: 500
            }}
          >
            {line.marge.toFixed(1)}%
          </Typography>
        </TableCell>

        <TableCell sx={{ minWidth: 120 }}>
          {!isSpecialLine ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onAddLine(position.id)}
                color="primary"
                title="Ajouter une ligne"
              >
                <i className="ri-add-line text-base" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const newLines = [...position.lignesChiffrage]
                  const currentIndex = newLines.findIndex(l => l.id === line.id)
                  const duplicatedLine = { 
                    ...line, 
                    id: generateId() 
                  }
                  newLines.splice(currentIndex + 1, 0, duplicatedLine)
                  updatePosition(position.id, 'lignesChiffrage', newLines)
                }}
                sx={{ color: 'info.main', p: 0.5 }}
                title="Dupliquer cette ligne"
              >
                <i className="ri-file-copy-line text-base" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteLine(position.id, line.id)}
                color="error"
                title="Supprimer cette ligne"
              >
                <i className="ri-delete-bin-line" />
              </IconButton>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'center', py: 1 }}>
              Auto
            </Typography>
          )}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="flex">
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        {/* Breadcrumb et header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link
              color="inherit"
              onClick={() => router.push('/apps/projets/list')}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className="ri-arrow-left-line" />
              Projets
            </Link>
            <Typography color="textPrimary">Nouveau Projet</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h4">
              Nouveau Projet
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<i className="ri-calculator-line" />}
                onClick={handleChiffrage}
                color="warning"
              >
                Chiffrage
              </Button>
              <Button
                variant="contained"
                startIcon={<i className="ri-save-line" />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Workflow Header */}
        <Box sx={{ mb: 4 }}>
          <WorkflowHeader 
            currentStage={projectData.etape}
            projectData={projectData}
            onStageClick={(newStage) => {
              setProjectData(prev => ({
                ...prev,
                etape: newStage
              }))
            }}
          />
        </Box>

        {/* Section Informations Générales */}
        <Accordion 
          expanded={expandedSections.informations}
          onChange={() => handleSectionToggle('informations')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-information-line" />
              Informations Générales
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Numéro ORE, Etape et Status */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Numéro ORE"
                  value={projectData.numeroORE}
                  onChange={(e) => {
                    let input = e.target.value
                    
                    // Extraire uniquement les chiffres
                    const digits = input.replace(/[^0-9]/g, '')
                    
                    // Formatage automatique en ORE-XX-XXXXX
                    if (digits.length === 0) {
                      handleInputChange('numeroORE', '')
                    } else if (digits.length <= 2) {
                      handleInputChange('numeroORE', `ORE-${digits}`)
                    } else if (digits.length <= 7) {
                      const year = digits.slice(0, 2)
                      const sequence = digits.slice(2)
                      handleInputChange('numeroORE', `ORE-${year}-${sequence}`)
                    } else {
                      // Limiter à 7 chiffres max (2 + 5)
                      const year = digits.slice(0, 2)
                      const sequence = digits.slice(2, 7)
                      handleInputChange('numeroORE', `ORE-${year}-${sequence}`)
                    }
                  }}
                  placeholder="ORE-25-12345"
                  helperText="Tapez seulement les chiffres (ex: 2512345)"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Étape</InputLabel>
                  <Select
                    value={projectData.etape}
                    onChange={(e) => handleInputChange('etape', e.target.value)}
                    label="Étape"
                  >
                    {(options.etapes || []).map(etape => (
                      <MenuItem key={etape.value} value={etape.value}>
                        <Chip
                          size="small"
                          label={etape.label}
                          color={etape.color}
                          variant="tonal"
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={projectData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Statut"
                  >
                    {(options.statuts || []).map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i 
                            className={classnames('ri-circle-fill text-xs', {
                              'text-info': status.value === 'nouveau',
                              'text-primary': status.value === 'en_cours', 
                              'text-success': status.value === 'termine',
                              'text-error': status.value === 'annule',
                              'text-warning': status.value === 'bloque'
                            })} 
                          />
                          <Typography variant='body2'>{status.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Client et Dates */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom du Client"
                  value={projectData.nomClient}
                  onChange={(e) => handleInputChange('nomClient', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date de Demande"
                  type="date"
                  value={projectData.dateDemande}
                  onChange={(e) => handleInputChange('dateDemande', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date d'Installation"
                  type="date"
                  value={projectData.dateInstallation}
                  onChange={(e) => handleInputChange('dateInstallation', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Personnel */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Vendeur</InputLabel>
                  <Select
                    value={projectData.vendeur}
                    onChange={(e) => handleInputChange('vendeur', e.target.value)}
                    label="Vendeur"
                  >
                    {(options.users || []).filter(user => user.roles?.includes('Vendeur')).map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Chiffreur</InputLabel>
                  <Select
                    value={projectData.chiffreur}
                    onChange={(e) => handleInputChange('chiffreur', e.target.value)}
                    label="Chiffreur"
                  >
                    {(options.users || []).filter(user => user.roles?.includes('Chiffreur')).map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Chef de Projet</InputLabel>
                  <Select
                    value={projectData.chefDeProjet}
                    onChange={(e) => handleInputChange('chefDeProjet', e.target.value)}
                    label="Chef de Projet"
                  >
                    {(options.users || []).filter(user => user.roles?.includes('Chef de Projet')).map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Commission et Détails */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Commission Agence (%)"
                  type="number"
                  value={projectData.commissionAgence}
                  onChange={(e) => handleInputChange('commissionAgence', e.target.value)}
                  variant="outlined"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Chances de gains:</Typography>
                  <Rating
                    value={projectData.importance}
                    onChange={(event, newValue) => handleInputChange('importance', newValue)}
                    max={3}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Concerne"
                  value={projectData.concerne}
                  onChange={(e) => handleInputChange('concerne', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={projectData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {projectData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleTagRemove(tag)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <TextField
                    placeholder="Ajouter un tag (appuyer sur Entrée)"
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTagAdd(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section Contacts */}
        <Accordion 
          expanded={expandedSections.contacts}
          onChange={() => handleSectionToggle('contacts')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-contacts-line" />
              Contacts
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Adresse d'installation */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse d'Installation"
                  multiline
                  rows={3}
                  value={projectData.adresseInstallation}
                  onChange={(e) => handleInputChange('adresseInstallation', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Contact Sur Place */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Contact Sur Place</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={projectData.contactSurPlace.nom}
                  onChange={(e) => handleNestedInputChange('contactSurPlace', 'nom', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poste"
                  value={projectData.contactSurPlace.poste}
                  onChange={(e) => handleNestedInputChange('contactSurPlace', 'poste', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={projectData.contactSurPlace.telephone}
                  onChange={(e) => handleNestedInputChange('contactSurPlace', 'telephone', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={projectData.contactSurPlace.email}
                  onChange={(e) => handleNestedInputChange('contactSurPlace', 'email', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Contact Client */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Contact Client</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={projectData.contactClient.nom}
                  onChange={(e) => handleNestedInputChange('contactClient', 'nom', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poste"
                  value={projectData.contactClient.poste}
                  onChange={(e) => handleNestedInputChange('contactClient', 'poste', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={projectData.contactClient.telephone}
                  onChange={(e) => handleNestedInputChange('contactClient', 'telephone', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={projectData.contactClient.email}
                  onChange={(e) => handleNestedInputChange('contactClient', 'email', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section Délais (Timeline sera implémentée dans la prochaine itération) */}
        <Accordion 
          expanded={expandedSections.delais}
          onChange={() => handleSectionToggle('delais')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-line" />
              Délais et Timeline
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              La gestion de timeline sera implémentée prochainement...
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Section Positions avec chiffrage complet */}
        <Accordion 
          expanded={expandedSections.positions}
          onChange={() => handleSectionToggle('positions')}
          sx={{ mb: 2 }}
          data-section="positions"
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-list-check-line" />
              Positions ({projectData.positions.length})
              <Button
                variant="outlined"
                size="small"
                startIcon={<i className="ri-add-line" />}
                onClick={addPosition}
                sx={{ ml: 'auto' }}
              >
                Ajouter une position
              </Button>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {projectData.positions.map((position, index) => (
              <Card key={position.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Position {position.numero}
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="Titre de la position"
                        value={position.titrePosition}
                        onChange={(e) => updatePosition(position.id, 'titrePosition', e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: 300 }}
                      />
                      <TextField
                        size="small"
                        placeholder="Titre"
                        value={position.titre}
                        onChange={(e) => updatePosition(position.id, 'titre', e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: 200 }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Quantité"
                        value={position.quantite}
                        onChange={(e) => updatePosition(position.id, 'quantite', parseInt(e.target.value) || 1)}
                        sx={{ width: 80 }}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="% Gestion"
                        value={position.projectManagementPercentage || 10}
                        onChange={(e) => updatePosition(position.id, 'projectManagementPercentage', parseFloat(e.target.value) || 10)}
                        sx={{ width: 90 }}
                        InputProps={{ 
                          inputProps: { min: 0, max: 100, step: 0.1 },
                          endAdornment: <Typography variant="caption">%</Typography>
                        }}
                      />
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={position.showImages}
                            onChange={(e) => updatePosition(position.id, 'showImages', e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <i className="ri-image-line" style={{ fontSize: '16px' }} />
                            <Typography variant="caption">Images</Typography>
                          </Box>
                        }
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={position.showDocuments}
                            onChange={(e) => updatePosition(position.id, 'showDocuments', e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <i className="ri-file-line" style={{ fontSize: '16px' }} />
                            <Typography variant="caption">Documents</Typography>
                          </Box>
                        }
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={position.showProduction}
                            onChange={(e) => updatePosition(position.id, 'showProduction', e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <i className="ri-settings-line" style={{ fontSize: '16px' }} />
                            <Typography variant="caption">Production</Typography>
                          </Box>
                        }
                        sx={{ mr: 2 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => duplicatePosition(position.id)}
                        color="info"
                        title="Dupliquer cette position"
                      >
                        <i className="ri-file-copy-line" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deletePosition(position.id)}
                        color="error"
                        title="Supprimer cette position"
                      >
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ bgcolor: 'primary.50', '& .MuiCardHeader-title': { width: '100%' } }}
                />
                <CardContent>
                  {/* Aide pour les formules */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <i className="ri-lightbulb-line" style={{ color: 'var(--mui-palette-info-main)' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main' }}>
                        Système de formules avancé
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Vous pouvez utiliser des formules dans les champs "Prix Unit. Achat" et "Quantité".
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      <strong>Variables disponibles:</strong> quantitePosition, L1.totalAchat, L1.prixUnitAchat, L2.quantite, etc.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      <strong>Exemples:</strong> L1.totalAchat*0.1, quantitePosition*2, (L1.prixUnitAchat+L2.prixUnitAchat)/2
                    </Typography>
                  </Box>

                  {/* Tableau des lignes de chiffrage */}
                  <TableContainer component={Paper} variant="outlined">
                    {isClient ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEndQuoteLines(event, position.id)}
                      >
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: 'background.default', fontWeight: 600 } }}>
                              <TableCell sx={{ width: '30px' }}></TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Infos</TableCell>
                              <TableCell>Prix Unit. Achat</TableCell>
                              <TableCell>Qté</TableCell>
                              <TableCell>Unité</TableCell>
                              <TableCell>Total Achat</TableCell>
                              <TableCell>Coeff</TableCell>
                              <TableCell>Prix Vente</TableCell>
                              <TableCell>P. Unit.</TableCell>
                              <TableCell>Marge %</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <SortableContext
                              items={position.lignesChiffrage.map(line => line.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {position.lignesChiffrage.map((line) => (
                                <SortableQuoteLine
                                  key={line.id}
                                  line={line}
                                  position={position}
                                  onUpdateLine={updateQuoteLine}
                                  onDeleteLine={deleteQuoteLine}
                                  onAddLine={addQuoteLine}
                                />
                              ))}
                            </SortableContext>
                          </TableBody>
                        </Table>
                      </DndContext>
                    ) : (
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: 'background.default', fontWeight: 600 } }}>
                            <TableCell sx={{ width: '30px' }}></TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Infos</TableCell>
                            <TableCell>Prix Unit. Achat</TableCell>
                            <TableCell>Qté</TableCell>
                            <TableCell>Unité</TableCell>
                            <TableCell>Total Achat</TableCell>
                            <TableCell>Coeff</TableCell>
                            <TableCell>Prix Vente</TableCell>
                            <TableCell>P. Unit.</TableCell>
                            <TableCell>Marge %</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {position.lignesChiffrage.map((line) => (
                            <SortableQuoteLine
                              key={line.id}
                              line={line}
                              position={position}
                              onUpdateLine={updateQuoteLine}
                              onDeleteLine={deleteQuoteLine}
                              onAddLine={addQuoteLine}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TableContainer>

                  {position.lignesChiffrage.length === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      border: '2px dashed', 
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.default'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Aucune ligne de chiffrage définie
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className="ri-add-line" />}
                        onClick={() => addQuoteLine(position.id)}
                      >
                        Ajouter la première ligne
                      </Button>
                    </Box>
                  )}

                  {/* Récapitulatif de la position */}
                  <PositionSummary position={position} />

                  {/* Boutons d'action */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className="ri-add-line" />}
                        onClick={() => addQuoteLine(position.id)}
                      >
                        Ajouter une ligne
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className="ri-briefcase-line" />}
                        onClick={() => addProjectManagementLine(position.id)}
                        disabled={position.lignesChiffrage.some(line => line.isProjectManagement)}
                        color="warning"
                      >
                        Gestion de projet
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className="ri-percent-line" />}
                        onClick={() => addCommissionLine(position.id)}
                        disabled={position.lignesChiffrage.some(line => line.isCommissionAgence)}
                        color="info"
                      >
                        Commission agence
                      </Button>
                    </Box>
                  </Box>

                  {/* Section Images */}
                  {position.showImages && (
                    <Box sx={{ mt: 3, p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="ri-image-line" />
                        Images de la position
                      </Typography>
                      <Box 
                        sx={{ 
                          border: '2px dashed', 
                          borderColor: 'primary.main', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: 'primary.50',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'primary.100',
                            borderColor: 'primary.dark'
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.multiple = true
                          input.onchange = (e) => handleFileUpload(e, position.id, 'images')
                          input.click()
                        }}
                      >
                        <i className="ri-image-add-line text-4xl text-primary mb-2" />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                          Cliquez pour ajouter des images
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Formats acceptés: JPG, PNG, GIF, WebP (Max: 5MB par fichier)
                        </Typography>
                      </Box>

                      {/* Aperçu des images */}
                      {position.images && position.images.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Images ajoutées ({position.images.length})
                          </Typography>
                          <Grid container spacing={1}>
                            {position.images.map((image, index) => (
                              <Grid item xs={6} sm={4} md={3} key={index}>
                                <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                                  <img 
                                    src={image.url} 
                                    alt={image.name}
                                    style={{ 
                                      width: '100%', 
                                      height: '120px', 
                                      objectFit: 'cover' 
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      position: 'absolute', 
                                      top: 4, 
                                      right: 4, 
                                      bgcolor: 'error.main', 
                                      color: 'white',
                                      '&:hover': { bgcolor: 'error.dark' }
                                    }}
                                    onClick={() => removeFile(position.id, 'images', index)}
                                  >
                                    <i className="ri-close-line" style={{ fontSize: '14px' }} />
                                  </IconButton>
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    left: 0, 
                                    right: 0, 
                                    bgcolor: 'rgba(0,0,0,0.7)', 
                                    color: 'white', 
                                    p: 0.5 
                                  }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                      {image.name}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Section Documents */}
                  {position.showDocuments && (
                    <Box sx={{ mt: 3, p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="ri-file-line" />
                        Documents de la position
                      </Typography>
                      <Box 
                        sx={{ 
                          border: '2px dashed', 
                          borderColor: 'info.main', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          bgcolor: 'info.50',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'info.100',
                            borderColor: 'info.dark'
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                          input.multiple = true
                          input.onchange = (e) => handleFileUpload(e, position.id, 'documents')
                          input.click()
                        }}
                      >
                        <i className="ri-file-add-line text-4xl text-info mb-2" />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main', mb: 1 }}>
                          Cliquez pour ajouter des documents
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB par fichier)
                        </Typography>
                      </Box>

                      {/* Liste des documents */}
                      {position.documents && position.documents.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Documents ajoutés ({position.documents.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {position.documents.map((doc, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 2, 
                                  p: 1, 
                                  border: '1px solid', 
                                  borderColor: 'divider', 
                                  borderRadius: 1,
                                  bgcolor: 'background.paper'
                                }}
                              >
                                <i className="ri-file-line text-2xl text-info" />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {doc.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => removeFile(position.id, 'documents', index)}
                                  color="error"
                                >
                                  <i className="ri-delete-bin-line" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {projectData.positions.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6, 
                border: '2px dashed', 
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Aucune position définie
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<i className="ri-add-line" />}
                  onClick={addPosition}
                >
                  Ajouter votre première position
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Section Récapitulatif Financier Global */}
        {projectData.positions.length > 0 && (
          <Card sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="ri-money-dollar-circle-line text-2xl text-primary" />
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    Récapitulatif Financier du Projet
                  </Typography>
                </Box>
              }
              sx={{ bgcolor: 'primary.50' }}
            />
            <CardContent>
              <ProjectFinancialSummary positions={projectData.positions} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default NewProjectForm