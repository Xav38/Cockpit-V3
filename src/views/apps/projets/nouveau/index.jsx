'use client'

// React Imports
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
      validationClient: { date: '', imperatif: false, personnel: '' },
      dossierProd: { date: '', imperatif: false, personnel: '' },
      prepress: { date: '', imperatif: false, personnel: '' },
      impression: { date: '', imperatif: false, personnel: '' },
      decoupe: { date: '', imperatif: false, personnel: '' },
      atelier: { date: '', imperatif: false, personnel: '' },
      atelierInf: { date: '', imperatif: false, personnel: '' },
      pose: { date: '', imperatif: false, personnel: '' }
    }
  })

  const [loading, setLoading] = useState(false)
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

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
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
              {/* Numéro ORE et Status */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro ORE"
                  value={projectData.numeroORE}
                  onChange={(e) => handleInputChange('numeroORE', e.target.value)}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={projectData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Statut"
                  >
                    {(options.statuts || []).map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <Chip
                          size="small"
                          label={status.label}
                          color={getStatusColor(status.value)}
                        />
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
                  <Typography variant="body2">Importance:</Typography>
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
                  label="Concerné"
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

        {/* Section Positions (sera implémentée dans la prochaine itération) */}
        <Accordion 
          expanded={expandedSections.positions}
          onChange={() => handleSectionToggle('positions')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-list-check-line" />
              Positions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              La gestion des positions sera implémentée prochainement...
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  )
}

export default NewProjectForm