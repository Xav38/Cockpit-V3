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
      dateDemande: '',
      maquette: { date: '', imperatif: false, personnel: '' },
      plans: { date: '', imperatif: false, personnel: '' },
      chiffrage: { date: '', imperatif: false, personnel: '' },
      validationChiffrage: { date: '', imperatif: false, personnel: '' },
      validationClient: { date: '', imperatif: false, personnel: '' },
      gestionProjet: { date: '', imperatif: false, personnel: '' },
      dossierProd: { date: '', imperatif: false, personnel: '' },
      production: { date: '', imperatif: false, personnel: '' },
      rework: { date: '', imperatif: false, personnel: '' },
      // Anciennes étapes conservées pour compatibilité
      prepress: { date: '', imperatif: false, personnel: '' },
      impression: { date: '', imperatif: false, personnel: '' },
      decoupe: { date: '', imperatif: false, personnel: '' },
      atelier: { date: '', imperatif: false, personnel: '' },
      atelierInf: { date: '', imperatif: false, personnel: '' },
      pose: { date: '', imperatif: false, personnel: '' }
    },
    // Positions
    positions: [
      {
        id: '1',
        numero: 1,
        titre: 'Position par défaut',
        quantite: 1,
        pourcentageGestionProjet: 15,
        lignesChiffrage: []
      }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState({
    statuts: [],
    users: [],
    etapes: []
  })

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Fonction pour formater le numéro ORE (format: ORE-XX-XXXXX)
  const formatORENumber = (value) => {
    // Extraire seulement les chiffres
    const digits = value.replace(/\D/g, '')
    
    // Construire le format ORE-XX-XXXXX
    let formatted = 'ORE-'
    
    if (digits.length >= 1) {
      // Ajouter les 2 premiers chiffres
      formatted += digits.substring(0, 2)
      
      if (digits.length > 2) {
        // Ajouter le tiret et les 5 chiffres suivants
        formatted += '-' + digits.substring(2, 7)
      }
    }
    
    return formatted
  }

  const handleOREChange = (value) => {
    const formatted = formatORENumber(value)
    setProjectData(prev => ({
      ...prev,
      numeroORE: formatted
    }))
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

  // Position management functions
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setProjectData(prev => {
        const oldIndex = prev.positions.findIndex(pos => pos.id === active.id)
        const newIndex = prev.positions.findIndex(pos => pos.id === over.id)
        const newPositions = arrayMove(prev.positions, oldIndex, newIndex)
        
        // Renumber positions
        const renumberedPositions = newPositions.map((pos, index) => ({
          ...pos,
          numero: index + 1
        }))

        return {
          ...prev,
          positions: renumberedPositions
        }
      })
    }
  }

  const addPosition = () => {
    const newId = Date.now().toString()
    const newPosition = {
      id: newId,
      numero: projectData.positions.length + 1,
      titre: `Position ${projectData.positions.length + 1}`,
      quantite: 1,
      pourcentageGestionProjet: 15,
      lignesChiffrage: []
    }

    setProjectData(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition]
    }))
  }

  const duplicatePosition = (positionId) => {
    const position = projectData.positions.find(p => p.id === positionId)
    if (position) {
      const newId = Date.now().toString()
      const newPosition = {
        ...position,
        id: newId,
        numero: projectData.positions.length + 1,
        titre: `${position.titre} (Copie)`
      }

      setProjectData(prev => ({
        ...prev,
        positions: [...prev.positions, newPosition]
      }))
    }
  }

  const deletePosition = (positionId) => {
    setProjectData(prev => {
      const newPositions = prev.positions
        .filter(p => p.id !== positionId)
        .map((pos, index) => ({ ...pos, numero: index + 1 }))

      return {
        ...prev,
        positions: newPositions
      }
    })
  }

  const updatePosition = (positionId, field, value) => {
    setProjectData(prev => ({
      ...prev,
      positions: prev.positions.map(pos => 
        pos.id === positionId 
          ? { ...pos, [field]: value }
          : pos
      )
    }))
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

  // Sortable Position Component
  const SortablePositionCard = ({ position, onUpdate, onDuplicate, onDelete }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: position.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <Card
        ref={setNodeRef}
        style={style}
        sx={{
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 2
          }
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                {...attributes}
                {...listeners}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'grab',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                  '&:active': { cursor: 'grabbing' }
                }}
              >
                <i className="ri-drag-move-2-line text-xl" />
              </Box>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                Position {position.numero}
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => onDuplicate(position.id)}
                  sx={{ color: 'info.main' }}
                >
                  <i className="ri-file-copy-line" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(position.id)}
                  sx={{ color: 'error.main' }}
                >
                  <i className="ri-delete-bin-line" />
                </IconButton>
              </Box>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Titre de la position"
                value={position.titre}
                onChange={(e) => onUpdate(position.id, 'titre', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantité"
                type="number"
                value={position.quantite}
                onChange={(e) => onUpdate(position.id, 'quantite', parseInt(e.target.value) || 1)}
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="% Gestion de projet"
                type="number"
                value={position.pourcentageGestionProjet}
                onChange={(e) => onUpdate(position.id, 'pourcentageGestionProjet', parseFloat(e.target.value) || 0)}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                InputProps={{
                  endAdornment: '%'
                }}
              />
            </Grid>
          </Grid>
          
          {/* Placeholder for Quote Lines Table */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-table-line" />
              Tableau des lignes de chiffrage (sera implémenté prochainement)
            </Typography>
          </Box>
        </CardContent>
      </Card>
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
              {projectData.numeroORE || 'Nouveau Projet'}
            </Typography>
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

        {/* Workflow Header */}
        <WorkflowHeader
          currentStage={projectData.etape}
          projectData={projectData}
          onStageClick={(newStage) => handleInputChange('etape', newStage)}
        />

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
                  onChange={(e) => handleOREChange(e.target.value)}
                  variant="outlined"
                  placeholder="ORE-25-12345"
                  helperText="Format: ORE-XX-XXXXX (chiffres uniquement)"
                  inputProps={{ 
                    maxLength: 13 
                  }}
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

        {/* Section Délais et Timeline */}
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
            <Grid container spacing={3}>
              {/* Timeline visuel */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-time-line" />
                  Planning des Étapes de Production
                </Typography>
              </Grid>

              {/* Date de la demande */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-file-text-line text-2xl text-info" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date de la Demande</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.dateDemande || projectData.dateDemande}
                      onChange={(e) => handleTimelineChange('dateDemande', null, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Maquette */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-palette-line text-2xl text-primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Maquette</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.maquette.date}
                      onChange={(e) => handleTimelineChange('maquette', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.maquette.imperatif}
                            onChange={(e) => handleTimelineChange('maquette', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.maquette.personnel}
                        onChange={(e) => handleTimelineChange('maquette', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Plans */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-draft-line text-2xl text-secondary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Plans</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.plans.date}
                      onChange={(e) => handleTimelineChange('plans', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.plans.imperatif}
                            onChange={(e) => handleTimelineChange('plans', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.plans.personnel}
                        onChange={(e) => handleTimelineChange('plans', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Chiffrage */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-calculator-line text-2xl text-warning" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Chiffrage</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.chiffrage.date}
                      onChange={(e) => handleTimelineChange('chiffrage', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.chiffrage.imperatif}
                            onChange={(e) => handleTimelineChange('chiffrage', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.chiffrage.personnel}
                        onChange={(e) => handleTimelineChange('chiffrage', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).filter(user => user.roles?.includes('Chiffreur')).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Validation Client */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-check-double-line text-2xl text-success" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Validation Client</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.validationClient.date}
                      onChange={(e) => handleTimelineChange('validationClient', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.validationClient.imperatif}
                            onChange={(e) => handleTimelineChange('validationClient', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.validationClient.personnel}
                        onChange={(e) => handleTimelineChange('validationClient', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).filter(user => user.roles?.includes('Vendeur')).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Dossier de Production */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-folder-line text-2xl text-info" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Dossier de Production</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.dossierProd.date}
                      onChange={(e) => handleTimelineChange('dossierProd', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.dossierProd.imperatif}
                            onChange={(e) => handleTimelineChange('dossierProd', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.dossierProd.personnel}
                        onChange={(e) => handleTimelineChange('dossierProd', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).filter(user => user.roles?.includes('Chef de Projet')).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Prépress */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-printer-cloud-line text-2xl text-primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Prépress</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.prepress.date}
                      onChange={(e) => handleTimelineChange('prepress', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.prepress.imperatif}
                            onChange={(e) => handleTimelineChange('prepress', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.prepress.personnel}
                        onChange={(e) => handleTimelineChange('prepress', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Impression */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-printer-line text-2xl text-secondary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Impression</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.impression.date}
                      onChange={(e) => handleTimelineChange('impression', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.impression.imperatif}
                            onChange={(e) => handleTimelineChange('impression', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.impression.personnel}
                        onChange={(e) => handleTimelineChange('impression', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Découpe */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-scissors-line text-2xl text-warning" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Découpe</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.decoupe.date}
                      onChange={(e) => handleTimelineChange('decoupe', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.decoupe.imperatif}
                            onChange={(e) => handleTimelineChange('decoupe', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.decoupe.personnel}
                        onChange={(e) => handleTimelineChange('decoupe', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Atelier */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-hammer-line text-2xl text-success" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Atelier</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.atelier.date}
                      onChange={(e) => handleTimelineChange('atelier', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.atelier.imperatif}
                            onChange={(e) => handleTimelineChange('atelier', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.atelier.personnel}
                        onChange={(e) => handleTimelineChange('atelier', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Atelier Infrastructure */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-tools-line text-2xl text-error" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Atelier Infrastructure</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.atelierInf.date}
                      onChange={(e) => handleTimelineChange('atelierInf', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.atelierInf.imperatif}
                            onChange={(e) => handleTimelineChange('atelierInf', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.atelierInf.personnel}
                        onChange={(e) => handleTimelineChange('atelierInf', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Pose */}
              <Grid item xs={12} md={6} lg={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className="ri-truck-line text-2xl text-primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pose / Installation</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={projectData.timeline.pose.date}
                      onChange={(e) => handleTimelineChange('pose', 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={projectData.timeline.pose.imperatif}
                            onChange={(e) => handleTimelineChange('pose', 'imperatif', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Impératif"
                      />
                    </Box>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={projectData.timeline.pose.personnel}
                        onChange={(e) => handleTimelineChange('pose', 'personnel', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Personnel assigné</MenuItem>
                        {(options.users || []).map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section Positions */}
        <Accordion 
          expanded={expandedSections.positions}
          onChange={() => handleSectionToggle('positions')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-list-check-line" />
              Positions ({projectData.positions.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Glissez-déposez les positions pour les réorganiser
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<i className="ri-add-line" />}
                onClick={addPosition}
              >
                Ajouter une position
              </Button>
            </Box>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={projectData.positions.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {projectData.positions.map((position) => (
                  <SortablePositionCard
                    key={position.id}
                    position={position}
                    onUpdate={updatePosition}
                    onDuplicate={duplicatePosition}
                    onDelete={deletePosition}
                  />
                ))}
              </SortableContext>
            </DndContext>

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
      </div>
    </div>
  )
}

export default NewProjectForm