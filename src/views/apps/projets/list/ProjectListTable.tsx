'use client'

// React Imports
import React, { useState, useMemo, useEffect, useRef } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import TablePagination from '@mui/material/TablePagination'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Popper from '@mui/material/Popper'
import MenuList from '@mui/material/MenuList'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Type Imports
import type { ThemeColor } from '@core/types'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserType = {
  id: string
  name: string
  initials: string
  color: string
  roles?: string[]
}

type ProjectDataType = {
  id: string
  numeroORE: string
  dateDemande: string
  client: string
  concerne: string
  delai: string
  etape: string
  status: string
  vendeur: UserType | null
  chiffreur: UserType | null
  chefDeProjet: UserType | null
  prixAchat: number | null
  marge: number | null
  prixVente: number | null
  importance: number
  tags: string[]
  imperatif: boolean
}

type OptionsType = {
  vendeurs: UserType[]
  chiffreurs: UserType[]
  chefsDeProjet: UserType[]
  statuts: { value: string; label: string; color: string }[]
  etapes: { value: string; label: string; color: string }[]
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const getStatusColor = (status: string): ThemeColor => {
  switch (status) {
    case 'nouveau': return 'info'
    case 'en_cours': return 'primary'
    case 'termine': return 'success'
    case 'annule': return 'error'
    case 'bloque': return 'warning'
    default: return 'secondary'
  }
}

const getEtapeColor = (etape: string): ThemeColor => {
  switch (etape) {
    case 'maquette': return 'info'
    case 'plans_techniques': return 'primary'
    case 'chiffrage': return 'warning'
    case 'validation_chiffrage': return 'secondary'
    case 'en_attente_retour_client': return 'warning'
    case 'validation_client': return 'success'
    case 'gestion_de_projet': return 'primary'
    case 'production': return 'info'
    case 'termine': return 'success'
    case 'annule': return 'error'
    default: return 'secondary'
  }
}

const columnHelper = createColumnHelper<ProjectDataType>()

const ProjectListTable = ({ projectData = [] }: { projectData?: ProjectDataType[] }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<ProjectDataType[]>(projectData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [options, setOptions] = useState<OptionsType | null>(null)
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({})
  const [statusFilter, setStatusFilter] = useState('')
  const [etapeFilter, setEtapeFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [concerneFilter, setConcerneFilter] = useState('')
  const [numeroOREFilter, setNumeroOREFilter] = useState('')
  const [vendeurFilter, setVendeurFilter] = useState('')
  const [chiffreurFilter, setChiffreurFilter] = useState('')
  const [chefProjetFilter, setChefProjetFilter] = useState('')
  const [dateDemandeFrom, setDateDemandeFrom] = useState('')
  const [dateDemandeTo, setDateDemandeTo] = useState('')
  const [delaiFrom, setDelaiFrom] = useState('')
  const [delaiTo, setDelaiTo] = useState('')
  const [prixAchatMin, setPrixAchatMin] = useState('')
  const [prixAchatMax, setPrixAchatMax] = useState('')
  const [margeMin, setMargeMin] = useState('')
  const [margeMax, setMargeMax] = useState('')
  const [prixVenteMin, setPrixVenteMin] = useState('')
  const [prixVenteMax, setPrixVenteMax] = useState('')
  const [imperatifFilter, setImperatifFilter] = useState('')
  const [importanceFilter, setImportanceFilter] = useState('')
  const [tagsFilter, setTagsFilter] = useState<string[]>([])

  // États pour le regroupement
  const [groupBy1, setGroupBy1] = useState('')
  const [groupBy2, setGroupBy2] = useState('')
  const [groupBy3, setGroupBy3] = useState('')

  // Options de regroupement basées sur toutes les colonnes
  const groupingOptions = [
    { value: '', label: 'Aucun regroupement' },
    { value: 'status', label: 'Statut' },
    { value: 'etape', label: 'Étape' },
    { value: 'client', label: 'Client' },
    { value: 'vendeur', label: 'Vendeur' },
    { value: 'chiffreur', label: 'Chiffreur' },
    { value: 'chefDeProjet', label: 'Chef de Projet' },
    { value: 'imperatif', label: 'Impératif' },
    { value: 'importance', label: 'Chances de gains' },
    { value: 'dateMonth', label: 'Mois de demande' },
    { value: 'delaiMonth', label: 'Mois de délai' },
    { value: 'separator1', label: '── Critères combinés ──', disabled: true },
    { value: 'responsableProjet', label: 'Responsable projet (Chiffreur OU Chef)' },
    { value: 'equipeVente', label: 'Équipe vente (Vendeur OU Chiffreur)' },
    { value: 'equipeProduction', label: 'Équipe production (Chiffreur OU Chef)' },
    { value: 'prioriteDate', label: 'Priorité & Urgence (Impératif + Date)' }
  ]

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/options')
      if (response.ok) {
        const data = await response.json()
        setOptions(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des options:', error)
    }
  }

  // Fonction de filtrage personnalisée
  const filteredData = useMemo(() => {
    let filtered = data

    // Filtrage par statut
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Filtrage par étape
    if (etapeFilter) {
      filtered = filtered.filter(project => project.etape === etapeFilter)
    }

    // Filtrage par texte
    if (clientFilter) {
      filtered = filtered.filter(project => 
        project.client.toLowerCase().includes(clientFilter.toLowerCase())
      )
    }

    if (concerneFilter) {
      filtered = filtered.filter(project => 
        project.concerne.toLowerCase().includes(concerneFilter.toLowerCase())
      )
    }

    if (numeroOREFilter) {
      filtered = filtered.filter(project => 
        project.numeroORE.toLowerCase().includes(numeroOREFilter.toLowerCase())
      )
    }

    // Filtrage par utilisateurs
    if (vendeurFilter) {
      filtered = filtered.filter(project => project.vendeur?.id === vendeurFilter)
    }

    if (chiffreurFilter) {
      filtered = filtered.filter(project => project.chiffreur?.id === chiffreurFilter)
    }

    if (chefProjetFilter) {
      filtered = filtered.filter(project => project.chefDeProjet?.id === chefProjetFilter)
    }

    // Filtrage par plages de dates
    if (dateDemandeFrom) {
      const fromDate = new Date(dateDemandeFrom)
      filtered = filtered.filter(project => new Date(project.dateDemande) >= fromDate)
    }

    if (dateDemandeTo) {
      const toDate = new Date(dateDemandeTo)
      filtered = filtered.filter(project => new Date(project.dateDemande) <= toDate)
    }

    if (delaiFrom) {
      const fromDate = new Date(delaiFrom)
      filtered = filtered.filter(project => new Date(project.delai) >= fromDate)
    }

    if (delaiTo) {
      const toDate = new Date(delaiTo)
      filtered = filtered.filter(project => new Date(project.delai) <= toDate)
    }

    // Filtrage par plages numériques
    if (prixAchatMin) {
      const min = parseFloat(prixAchatMin)
      filtered = filtered.filter(project => 
        project.prixAchat && project.prixAchat >= min
      )
    }

    if (prixAchatMax) {
      const max = parseFloat(prixAchatMax)
      filtered = filtered.filter(project => 
        project.prixAchat && project.prixAchat <= max
      )
    }

    if (margeMin) {
      const min = parseFloat(margeMin)
      filtered = filtered.filter(project => 
        project.marge && project.marge >= min
      )
    }

    if (margeMax) {
      const max = parseFloat(margeMax)
      filtered = filtered.filter(project => 
        project.marge && project.marge <= max
      )
    }

    if (prixVenteMin) {
      const min = parseFloat(prixVenteMin)
      filtered = filtered.filter(project => 
        project.prixVente && project.prixVente >= min
      )
    }

    if (prixVenteMax) {
      const max = parseFloat(prixVenteMax)
      filtered = filtered.filter(project => 
        project.prixVente && project.prixVente <= max
      )
    }

    // Filtrage par impératif
    if (imperatifFilter) {
      const isImperatif = imperatifFilter === 'true'
      filtered = filtered.filter(project => project.imperatif === isImperatif)
    }

    // Filtrage par importance
    if (importanceFilter) {
      const importance = parseInt(importanceFilter)
      filtered = filtered.filter(project => project.importance === importance)
    }

    // Filtrage par tags
    if (tagsFilter.length > 0) {
      filtered = filtered.filter(project => 
        project.tags && project.tags.some(tag => 
          tagsFilter.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      )
    }

    return filtered
  }, [
    data, statusFilter, etapeFilter, clientFilter, concerneFilter, numeroOREFilter,
    vendeurFilter, chiffreurFilter, chefProjetFilter,
    dateDemandeFrom, dateDemandeTo, delaiFrom, delaiTo,
    prixAchatMin, prixAchatMax, margeMin, margeMax, prixVenteMin, prixVenteMax,
    imperatifFilter, importanceFilter, tagsFilter
  ])

  const getGroupDisplayElement = (label: string, groupBy: string, project?: ProjectDataType) => {
    switch (groupBy) {
      case 'status':
        const statusConfig = {
          nouveau: { color: 'text-info', icon: 'ri-circle-fill', bgColor: 'info' },
          en_cours: { color: 'text-primary', icon: 'ri-circle-fill', bgColor: 'primary' },
          termine: { color: 'text-success', icon: 'ri-circle-fill', bgColor: 'success' },
          annule: { color: 'text-error', icon: 'ri-circle-fill', bgColor: 'error' },
          bloque: { color: 'text-warning', icon: 'ri-circle-fill', bgColor: 'warning' }
        }
        const statusKey = label.replace('Sans statut', 'nouveau')
        const statusStyle = statusConfig[statusKey] || statusConfig.nouveau
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className={`${statusStyle.icon} text-xs ${statusStyle.color}`} />
            <Typography variant="inherit">
              {label.charAt(0).toUpperCase() + label.slice(1).replace('_', ' ')}
            </Typography>
          </Box>
        )

      case 'etape':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              variant="tonal"
              label={label}
              color="secondary"
            />
          </Box>
        )

      case 'vendeur':
      case 'chiffreur':  
      case 'chefDeProjet':
        if (label.startsWith('Sans ')) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div className="flex items-center justify-center bs-6 is-6 rounded bg-gray-100">
                <i className="ri-user-line text-xs text-textDisabled" />
              </div>
              <Typography variant="inherit" color="text.secondary">{label}</Typography>
            </Box>
          )
        }
        
        // Extraire le nom de l'utilisateur du label
        const userName = label.replace(/^(Chef: |Chiffreur: |Vendeur: |Chef de projet: )/, '')
        const user = project && (
          project.vendeur?.name === userName ? project.vendeur :
          project.chiffreur?.name === userName ? project.chiffreur :
          project.chefDeProjet?.name === userName ? project.chefDeProjet : null
        )
        
        if (user) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div className="flex items-center justify-center bs-6 is-6 rounded" style={{ backgroundColor: user.color + '20' }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: user.color }}>
                  {user.initials}
                </Typography>
              </div>
              <Typography variant="inherit">{userName}</Typography>
            </Box>
          )
        }
        break

      case 'imperatif':
        const isImperatif = label === 'Impératif'
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch 
              checked={isImperatif}
              disabled 
              size="small"
              color={isImperatif ? 'error' : 'success'}
            />
            <Typography variant="inherit">{label}</Typography>
          </Box>
        )

      case 'importance':
        const rating = parseInt(label.split(' ')[0]) || 0
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={rating} readOnly size="small" max={3} />
            <Typography variant="inherit">{label}</Typography>
          </Box>
        )

      case 'responsableProjet':
      case 'equipeVente': 
      case 'equipeProduction':
        if (label.startsWith('Sans ')) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div className="flex items-center justify-center bs-6 is-6 rounded bg-gray-100">
                <i className="ri-team-line text-xs text-textDisabled" />
              </div>
              <Typography variant="inherit" color="text.secondary">{label}</Typography>
            </Box>
          )
        }
        
        // Pour les critères combinés avec utilisateurs, extraire le nom et le rôle
        const match = label.match(/^(Chef|Chiffreur|Vendeur|Chef de projet): (.+)$/)
        if (match && project) {
          const [, role, name] = match
          const user2 = 
            project.vendeur?.name === name ? project.vendeur :
            project.chiffreur?.name === name ? project.chiffreur :
            project.chefDeProjet?.name === name ? project.chefDeProjet : null
            
          if (user2) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div className="flex items-center justify-center bs-6 is-6 rounded" style={{ backgroundColor: user2.color + '20' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: user2.color }}>
                    {user2.initials}
                  </Typography>
                </div>
                <Typography variant="inherit">{role}: {name}</Typography>
              </Box>
            )
          }
        }
        break

      default:
        return <Typography variant="inherit">{label}</Typography>
    }
    
    return <Typography variant="inherit">{label}</Typography>
  }

  const getGroupValue = (project: ProjectDataType, groupBy: string): string => {
    switch (groupBy) {
      case 'status':
        return project.status || 'Sans statut'
      case 'etape':
        return project.etape || 'Sans étape'
      case 'client':
        return project.client || 'Sans client'
      case 'vendeur':
        return project.vendeur?.name || 'Sans vendeur'
      case 'chiffreur':
        return project.chiffreur?.name || 'Sans chiffreur'
      case 'chefDeProjet':
        return project.chefDeProjet?.name || 'Sans chef de projet'
      case 'imperatif':
        return project.imperatif ? 'Impératif' : 'Flexible'
      case 'importance':
        return `${project.importance} étoile${project.importance > 1 ? 's' : ''}`
      case 'dateMonth':
        try {
          const date = new Date(project.dateDemande)
          return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
        } catch {
          return 'Date invalide'
        }
      case 'delaiMonth':
        try {
          const date = new Date(project.delai)
          return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
        } catch {
          return 'Date invalide'
        }
      
      // Critères combinés
      case 'responsableProjet':
        if (project.chefDeProjet?.name) return `Chef: ${project.chefDeProjet.name}`
        if (project.chiffreur?.name) return `Chiffreur: ${project.chiffreur.name}`
        return 'Sans responsable'
      
      case 'equipeVente':
        if (project.vendeur?.name) return `Vendeur: ${project.vendeur.name}`
        if (project.chiffreur?.name) return `Chiffreur: ${project.chiffreur.name}`
        return 'Sans équipe vente'
      
      case 'equipeProduction':
        if (project.chefDeProjet?.name) return `Chef de projet: ${project.chefDeProjet.name}`
        if (project.chiffreur?.name) return `Chiffreur: ${project.chiffreur.name}`
        return 'Sans équipe production'
      
      case 'prioriteDate':
        const isImperatif = project.imperatif ? 'Impératif' : 'Flexible'
        try {
          const date = new Date(project.delai)
          const now = new Date()
          const diffTime = date.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) return `${isImperatif} - En retard (${Math.abs(diffDays)}j)`
          if (diffDays <= 7) return `${isImperatif} - Urgent (${diffDays}j)`
          if (diffDays <= 30) return `${isImperatif} - Proche (${diffDays}j)`
          return `${isImperatif} - À long terme (${diffDays}j)`
        } catch {
          return `${isImperatif} - Date invalide`
        }
      
      default:
        return 'Autre'
    }
  }

  // Fonction pour regrouper les données
  const groupedData = useMemo(() => {
    if (!groupBy1 && !groupBy2 && !groupBy3) {
      return { flatData: filteredData, groupedData: null }
    }

    const groups = new Map<string, any>()
    
    filteredData.forEach(project => {
      const key1 = groupBy1 ? getGroupValue(project, groupBy1) : 'root'
      const key2 = groupBy2 ? getGroupValue(project, groupBy2) : 'root'
      const key3 = groupBy3 ? getGroupValue(project, groupBy3) : 'root'
      
      const fullKey = `${key1}|${key2}|${key3}`
      
      if (!groups.has(fullKey)) {
        groups.set(fullKey, {
          key1,
          key2,
          key3,
          projects: [],
          count: 0
        })
      }
      
      groups.get(fullKey)!.projects.push(project)
      groups.get(fullKey)!.count++
    })

    // Organiser les groupes en structure hiérarchique
    const organizedGroups = new Map()
    
    groups.forEach((group, fullKey) => {
      const { key1, key2, key3, projects, count } = group
      
      if (!organizedGroups.has(key1)) {
        organizedGroups.set(key1, {
          label: key1,
          level: 1,
          children: new Map(),
          projects: [],
          count: 0
        })
      }
      
      const level1 = organizedGroups.get(key1)
      level1.count += count
      
      if (groupBy2) {
        if (!level1.children.has(key2)) {
          level1.children.set(key2, {
            label: key2,
            level: 2,
            children: new Map(),
            projects: [],
            count: 0
          })
        }
        
        const level2 = level1.children.get(key2)
        level2.count += count
        
        if (groupBy3) {
          if (!level2.children.has(key3)) {
            level2.children.set(key3, {
              label: key3,
              level: 3,
              children: new Map(),
              projects: [],
              count: 0
            })
          }
          
          const level3 = level2.children.get(key3)
          level3.projects.push(...projects)
          level3.count = count
        } else {
          level2.projects.push(...projects)
        }
      } else {
        level1.projects.push(...projects)
      }
    })

    return { flatData: filteredData, groupedData: organizedGroups }
  }, [filteredData, groupBy1, groupBy2, groupBy3])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return dateString
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'CHF 0'
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(price))
  }

  const formatMarge = (marge: number | null) => {
    if (!marge) return '-'
    return `${marge.toFixed(1)}%`
  }

  const handleImperatifChange = async (projectId: string, newValue: boolean) => {
    setLoading(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imperatif: newValue })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }
      
      const updatedProject = await response.json()
      
      // Mettre à jour les données locales
      setData(prevData => 
        prevData.map(project => 
          project.id === projectId 
            ? { ...project, imperatif: newValue }
            : project
        )
      )
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleImportanceChange = async (projectId: string, newValue: number | null) => {
    if (!newValue || newValue < 1 || newValue > 3) return
    
    setLoading(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importance: newValue })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }
      
      const updatedProject = await response.json()
      
      // Mettre à jour les données locales
      setData(prevData => 
        prevData.map(project => 
          project.id === projectId 
            ? { ...project, importance: newValue }
            : project
        )
      )
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleFieldUpdate = async (projectId: string, field: string, value: any) => {
    const key = `${projectId}-${field}`
    setUpdating(prev => ({ ...prev, [key]: true }))
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }
      
      const updatedProject = await response.json()
      
      // Mettre à jour les données locales
      setData(prevData => 
        prevData.map(project => 
          project.id === projectId 
            ? { ...project, ...updatedProject }
            : project
        )
      )
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setUpdating(prev => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
    }
  }

  const getUserAvatar = (user: { name: string; initials?: string; color?: string } | null) => {
    if (!user) {
      return (
        <CustomAvatar skin='light' size={32} color='secondary'>
          ?
        </CustomAvatar>
      )
    }

    const initials = user.initials || getInitials(user.name)
    
    // Couleurs du thème Materialize si aucune couleur personnalisée
    const themeColors = ['#666CFF', '#72E128', '#FDB528', '#26C6F9', '#FF4D49', '#6D788D']
    const fallbackColor = user.color || themeColors[user.name.length % themeColors.length]
    
    return (
      <CustomAvatar 
        skin='filled' 
        size={32}
        sx={{
          backgroundColor: fallbackColor,
          color: '#FFFFFF',
          fontSize: '0.875rem',
          fontWeight: 600
        }}
      >
        {initials}
      </CustomAvatar>
    )
  }

  // Composants de sélection personnalisés avec MenuList Composition
  const EtapeSelector = ({ project, etape, onUpdate }: { 
    project: ProjectDataType, 
    etape: string, 
    onUpdate: (value: string) => void 
  }) => {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef<HTMLDivElement>(null)
    const currentEtape = options?.etapes.find(e => e.value === etape)
    const isUpdating = updating[`${project.id}-etape`]

    const handleToggle = () => setOpen(!open)
    
    const handleClose = (event?: Event | React.SyntheticEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
        return
      }
      setOpen(false)
    }

    const handleSelect = (value: string) => {
      onUpdate(value)
      setOpen(false)
    }

    return (
      <>
        <Box
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            opacity: isUpdating ? 0.5 : 1,
            pointerEvents: isUpdating ? 'none' : 'auto'
          }}
        >
          <Chip
            variant='tonal'
            color={getEtapeColor(etape)}
            label={currentEtape?.label || etape}
            size='small'
          />
        </Box>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          transition
          disablePortal
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Paper sx={{ boxShadow: 2, minWidth: 180 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open}>
                    {options?.etapes.map((etape) => (
                      <MenuItem
                        key={etape.value}
                        onClick={() => handleSelect(etape.value)}
                        selected={etape.value === project.etape}
                      >
                        <Chip
                          variant='tonal'
                          color={etape.color as ThemeColor}
                          label={etape.label}
                          size='small'
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    )
  }

  const StatusSelector = ({ project, status, onUpdate }: { 
    project: ProjectDataType, 
    status: string, 
    onUpdate: (value: string) => void 
  }) => {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef<HTMLDivElement>(null)
    const currentStatus = options?.statuts.find(s => s.value === status)
    const isUpdating = updating[`${project.id}-status`]

    const handleToggle = () => setOpen(!open)
    
    const handleClose = (event?: Event | React.SyntheticEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
        return
      }
      setOpen(false)
    }

    const handleSelect = (value: string) => {
      onUpdate(value)
      setOpen(false)
    }

    return (
      <>
        <Box
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: isUpdating ? 0.5 : 1,
            pointerEvents: isUpdating ? 'none' : 'auto',
            p: 0.5,
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <i 
            className={classnames('ri-circle-fill text-xs', {
              'text-info': status === 'nouveau',
              'text-primary': status === 'en_cours', 
              'text-success': status === 'termine',
              'text-error': status === 'annule',
              'text-warning': status === 'bloque'
            })} 
          />
          <Typography variant='body2' className='capitalize'>
            {currentStatus?.label || status.replace('_', ' ')}
          </Typography>
        </Box>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          transition
          disablePortal
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Paper sx={{ boxShadow: 2, minWidth: 140 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open}>
                    {options?.statuts.map((statut) => (
                      <MenuItem
                        key={statut.value}
                        onClick={() => handleSelect(statut.value)}
                        selected={statut.value === project.status}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <i 
                            className={classnames('ri-circle-fill text-xs', {
                              'text-info': statut.value === 'nouveau',
                              'text-primary': statut.value === 'en_cours', 
                              'text-success': statut.value === 'termine',
                              'text-error': statut.value === 'annule',
                              'text-warning': statut.value === 'bloque'
                            })} 
                          />
                          <Typography variant='body2'>
                            {statut.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    )
  }

  const UserSelector = ({ project, user, fieldName, userOptions, onUpdate }: {
    project: ProjectDataType,
    user: UserType | null,
    fieldName: string,
    userOptions: UserType[],
    onUpdate: (value: string | null) => void
  }) => {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef<HTMLDivElement>(null)
    const isUpdating = updating[`${project.id}-${fieldName}`]

    const handleToggle = () => setOpen(!open)
    
    const handleClose = (event?: Event | React.SyntheticEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
        return
      }
      setOpen(false)
    }

    const handleSelect = (userId: string | null) => {
      onUpdate(userId)
      setOpen(false)
    }

    return (
      <>
        <Box
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: isUpdating ? 0.5 : 1,
            pointerEvents: isUpdating ? 'none' : 'auto',
            p: 0.5,
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          {getUserAvatar(user)}
          <Typography variant='body2'>
            {user?.name || 'Non assigné'}
          </Typography>
        </Box>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          transition
          disablePortal
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Paper sx={{ boxShadow: 2, minWidth: 200 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open}>
                    <MenuItem
                      onClick={() => handleSelect(null)}
                      selected={!user}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getUserAvatar(null)}
                        <Typography>Non assigné</Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    {userOptions.map((option) => (
                      <MenuItem
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        selected={option.id === user?.id}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getUserAvatar(option)}
                            <Typography>{option.name}</Typography>
                          </Box>
                          {option.roles && option.roles.length > 1 && (
                            <Typography variant='caption' sx={{ color: 'text.secondary', ml: 4.5 }}>
                              Rôles: {option.roles.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    )
  }

  const columns = useMemo<ColumnDef<ProjectDataType, any>[]>(
    () => [
      columnHelper.accessor('numeroORE', {
        header: 'N° ORE',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.numeroORE}
          </Typography>
        )
      }),
      columnHelper.accessor('dateDemande', {
        header: 'Date demande',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {formatDate(row.original.dateDemande)}
          </Typography>
        )
      }),
      columnHelper.accessor('client', {
        header: 'Client',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.client}
          </Typography>
        )
      }),
      columnHelper.accessor('concerne', {
        header: 'Concerne',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.concerne}
          </Typography>
        )
      }),
      columnHelper.accessor('delai', {
        header: 'Délai',
        cell: ({ row }) => (
          <Typography 
            color='text.primary' 
            className={row.original.imperatif ? 'font-bold text-error' : ''}
          >
            {formatDate(row.original.delai)}
          </Typography>
        )
      }),
      columnHelper.accessor('imperatif', {
        header: 'Impératif',
        cell: ({ row }) => (
          <Switch 
            checked={row.original.imperatif}
            color='error'
            size='small'
            disabled={loading === row.original.id}
            onChange={(event) => handleImperatifChange(row.original.id, event.target.checked)}
          />
        )
      }),
      columnHelper.accessor('etape', {
        header: 'Étape',
        cell: ({ row }) => (
          <EtapeSelector
            project={row.original}
            etape={row.original.etape}
            onUpdate={(value) => handleFieldUpdate(row.original.id, 'etape', value)}
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <StatusSelector
            project={row.original}
            status={row.original.status}
            onUpdate={(value) => handleFieldUpdate(row.original.id, 'status', value)}
          />
        )
      }),
      columnHelper.accessor('vendeur', {
        header: 'Vendeur',
        cell: ({ row }) => (
          <UserSelector
            project={row.original}
            user={row.original.vendeur}
            fieldName='vendeurId'
            userOptions={options?.vendeurs || []}
            onUpdate={(value) => handleFieldUpdate(row.original.id, 'vendeurId', value)}
          />
        )
      }),
      columnHelper.accessor('chiffreur', {
        header: 'Chiffreur',
        cell: ({ row }) => (
          <UserSelector
            project={row.original}
            user={row.original.chiffreur}
            fieldName='chiffreurId'
            userOptions={options?.chiffreurs || []}
            onUpdate={(value) => handleFieldUpdate(row.original.id, 'chiffreurId', value)}
          />
        )
      }),
      columnHelper.accessor('chefDeProjet', {
        header: 'Chef de projet',
        cell: ({ row }) => (
          <UserSelector
            project={row.original}
            user={row.original.chefDeProjet}
            fieldName='chefProjetId'
            userOptions={options?.chefsDeProjet || []}
            onUpdate={(value) => handleFieldUpdate(row.original.id, 'chefProjetId', value)}
          />
        )
      }),
      columnHelper.accessor('prixAchat', {
        header: 'Prix d\'achat',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.prixAchat ? formatPrice(row.original.prixAchat) : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('marge', {
        header: 'Marge',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {formatMarge(row.original.marge)}
          </Typography>
        )
      }),
      columnHelper.accessor('prixVente', {
        header: 'Prix de vente',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.prixVente ? formatPrice(row.original.prixVente) : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('importance', {
        header: 'Chances de gains',
        cell: ({ row }) => (
          <Rating
            value={row.original.importance}
            size='small'
            max={3}
            disabled={loading === row.original.id}
            onChange={(_, newValue) => handleImportanceChange(row.original.id, newValue)}
          />
        )
      }),
      columnHelper.accessor('tags', {
        header: 'Tags',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            {row.original.tags && row.original.tags.length > 0 ? (
              row.original.tags.slice(0, 2).map((tag, index) => (
                <Chip key={index} label={tag} size='small' variant='outlined' />
              ))
            ) : (
              <Typography variant='body2' color='text.secondary'>-</Typography>
            )}
            {row.original.tags && row.original.tags.length > 2 && (
              <Typography variant='body2' color='text.secondary'>
                +{row.original.tags.length - 2}
              </Typography>
            )}
          </div>
        )
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small'>
              <i className='ri-eye-line text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => setData(data?.filter(p => p.id !== row.original.id))}>
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }
    ],
    [data, loading, handleImperatifChange, handleImportanceChange, formatPrice, formatMarge, getUserAvatar, options, updating, handleFieldUpdate]
  )

  const table = useReactTable({
    data: groupedData.flatData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardHeader title='Liste des Projets' />
      <Divider />
      {/* Barre de filtrage améliorée */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* Recherche rapide toujours visible */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Rechercher dans tous les projets...'
            sx={{ flex: 1, minWidth: 250 }}
          />
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <Select
              displayEmpty
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              renderValue={(value) => value ? options?.statuts.find(s => s.value === value)?.label : 'Tous les statuts'}
            >
              <MenuItem value=''>Tous les statuts</MenuItem>
              {options?.statuts.map(status => (
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
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={etapeFilter}
              onChange={(e) => setEtapeFilter(e.target.value)}
              renderValue={(value) => value ? options?.etapes.find(e => e.value === value)?.label : 'Toutes les étapes'}
            >
              <MenuItem value=''>Toutes les étapes</MenuItem>
              {options?.etapes.map(etape => (
                <MenuItem key={etape.value} value={etape.value}>
                  <Chip
                    variant='tonal'
                    color={etape.color as ThemeColor}
                    label={etape.label}
                    size='small'
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Filtres avancés dans des sections pliables */}
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary 
            expandIcon={<i className='ri-arrow-down-s-line' />}
            sx={{ 
              minHeight: 'auto', 
              '&.Mui-expanded': { minHeight: 'auto' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-filter-3-line' />
              <Typography variant='subtitle2'>Filtres avancés</Typography>
              <Typography variant='caption' color='text.secondary'>
                (Texte, Dates, Prix, Équipe)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Grid container spacing={3}>
              {/* Section Informations générales */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  <i className='ri-information-line' style={{ marginRight: 8 }} />
                  Informations générales
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    size='small'
                    label='Client'
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    placeholder='Rechercher par nom de client'
                  />
                  <TextField
                    size='small'
                    label='Objet du projet'
                    value={concerneFilter}
                    onChange={(e) => setConcerneFilter(e.target.value)}
                    placeholder='Rechercher dans les objets'
                  />
                  <TextField
                    size='small'
                    label='N° ORE'
                    value={numeroOREFilter}
                    onChange={(e) => setNumeroOREFilter(e.target.value)}
                    placeholder='Ex: ORE-2024-001'
                  />
                </Box>
              </Grid>

              {/* Section Équipe */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  <i className='ri-team-line' style={{ marginRight: 8 }} />
                  Équipe projet
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size='small'>
                    <Select
                      displayEmpty
                      value={vendeurFilter}
                      onChange={(e) => setVendeurFilter(e.target.value)}
                      renderValue={(value) => value ? options?.vendeurs.find(v => v.id === value)?.name : 'Tous les vendeurs'}
                    >
                      <MenuItem value=''>Tous les vendeurs</MenuItem>
                      {options?.vendeurs.map(vendeur => (
                        <MenuItem key={vendeur.id} value={vendeur.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography>{vendeur.name}</Typography>
                            {vendeur.roles && vendeur.roles.length > 1 && (
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                Rôles: {vendeur.roles.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size='small'>
                    <Select
                      displayEmpty
                      value={chiffreurFilter}
                      onChange={(e) => setChiffreurFilter(e.target.value)}
                      renderValue={(value) => value ? options?.chiffreurs.find(c => c.id === value)?.name : 'Tous les chiffreurs'}
                    >
                      <MenuItem value=''>Tous les chiffreurs</MenuItem>
                      {options?.chiffreurs.map(chiffreur => (
                        <MenuItem key={chiffreur.id} value={chiffreur.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography>{chiffreur.name}</Typography>
                            {chiffreur.roles && chiffreur.roles.length > 1 && (
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                Rôles: {chiffreur.roles.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size='small'>
                    <Select
                      displayEmpty
                      value={chefProjetFilter}
                      onChange={(e) => setChefProjetFilter(e.target.value)}
                      renderValue={(value) => value ? options?.chefsDeProjet.find(c => c.id === value)?.name : 'Tous les chefs de projet'}
                    >
                      <MenuItem value=''>Tous les chefs de projet</MenuItem>
                      {options?.chefsDeProjet.map(chef => (
                        <MenuItem key={chef.id} value={chef.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography>{chef.name}</Typography>
                            {chef.roles && chef.roles.length > 1 && (
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                Rôles: {chef.roles.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Section Dates */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  <i className='ri-calendar-line' style={{ marginRight: 8 }} />
                  Périodes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Date demande dès'
                      type='date'
                      value={dateDemandeFrom}
                      onChange={(e) => setDateDemandeFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          '& input': {
                            color: 'text.primary',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'text.secondary',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label="Date demande jusqu'à"
                      type='date'
                      value={dateDemandeTo}
                      onChange={(e) => setDateDemandeTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          '& input': {
                            color: 'text.primary',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'text.secondary',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Délai dès'
                      type='date'
                      value={delaiFrom}
                      onChange={(e) => setDelaiFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          '& input': {
                            color: 'text.primary',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'text.secondary',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label="Délai jusqu'à"
                      type='date'
                      value={delaiTo}
                      onChange={(e) => setDelaiTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          '& input': {
                            color: 'text.primary',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'text.secondary',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section Prix */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  <i className='ri-money-dollar-circle-line' style={{ marginRight: 8 }} />
                  Fourchettes financières
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Prix achat min'
                      type='number'
                      value={prixAchatMin}
                      onChange={(e) => setPrixAchatMin(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>CHF</Typography> }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Prix achat max'
                      type='number'
                      value={prixAchatMax}
                      onChange={(e) => setPrixAchatMax(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>CHF</Typography> }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Marge min'
                      type='number'
                      value={margeMin}
                      onChange={(e) => setMargeMin(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>%</Typography> }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Marge max'
                      type='number'
                      value={margeMax}
                      onChange={(e) => setMargeMax(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>%</Typography> }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Prix vente min'
                      type='number'
                      value={prixVenteMin}
                      onChange={(e) => setPrixVenteMin(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>CHF</Typography> }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      label='Prix vente max'
                      type='number'
                      value={prixVenteMax}
                      onChange={(e) => setPrixVenteMax(e.target.value)}
                      InputProps={{ endAdornment: <Typography variant='caption'>CHF</Typography> }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section Caractéristiques spéciales */}
              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  <i className='ri-settings-3-line' style={{ marginRight: 8 }} />
                  Caractéristiques spéciales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='caption' display='block' sx={{ mb: 1 }}>Urgence</Typography>
                    <FormControl size='small' fullWidth>
                      <Select
                        displayEmpty
                        value={imperatifFilter}
                        onChange={(e) => setImperatifFilter(e.target.value)}
                        renderValue={(value) => {
                          if (value === '') return 'Tous les projets'
                          return value === 'true' ? 'Projets impératifs' : 'Projets flexibles'
                        }}
                      >
                        <MenuItem value=''>Tous les projets</MenuItem>
                        <MenuItem value='true'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch checked disabled size='small' color='error' />
                            <Typography>Impératifs</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value='false'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch disabled size='small' color='success' />
                            <Typography>Flexibles</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='caption' display='block' sx={{ mb: 1 }}>Chances de gains</Typography>
                    <FormControl size='small' fullWidth>
                      <Select
                        displayEmpty
                        value={importanceFilter}
                        onChange={(e) => setImportanceFilter(e.target.value)}
                        renderValue={(value) => {
                          if (value === '') return 'Toutes les chances'
                          return `Chance ${value}/3`
                        }}
                      >
                        <MenuItem value=''>Toutes les chances</MenuItem>
                        <MenuItem value='1'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={1} readOnly size='small' max={3} />
                            <Typography>Faible (1/3)</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value='2'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={2} readOnly size='small' max={3} />
                            <Typography>Moyenne (2/3)</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value='3'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={3} readOnly size='small' max={3} />
                            <Typography>Haute (3/3)</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='caption' display='block' sx={{ mb: 1 }}>Tags</Typography>
                    <Autocomplete
                      multiple
                      size='small'
                      options={Array.from(new Set(data.flatMap(project => project.tags || [])))}
                      value={tagsFilter}
                      onChange={(_, newValue) => setTagsFilter(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Sélectionner des tags'
                        />
                      )}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => {
                          const { key, ...chipProps } = getTagProps({ index })
                          return (
                            <Chip
                              key={option}
                              variant='outlined'
                              label={option}
                              size='small'
                              {...chipProps}
                            />
                          )
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='caption' color='text.secondary'>
                {filteredData.length} projet{filteredData.length > 1 ? 's' : ''} trouvé{filteredData.length > 1 ? 's' : ''}
              </Typography>
              <Button 
                variant='outlined' 
                size='small'
                startIcon={<i className='ri-close-line' />}
                onClick={() => {
                  setGlobalFilter('')
                  setStatusFilter('')
                  setEtapeFilter('')
                  setClientFilter('')
                  setConcerneFilter('')
                  setNumeroOREFilter('')
                  setVendeurFilter('')
                  setChiffreurFilter('')
                  setChefProjetFilter('')
                  setDateDemandeFrom('')
                  setDateDemandeTo('')
                  setDelaiFrom('')
                  setDelaiTo('')
                  setPrixAchatMin('')
                  setPrixAchatMax('')
                  setMargeMin('')
                  setMargeMax('')
                  setPrixVenteMin('')
                  setPrixVenteMax('')
                  setImperatifFilter('')
                  setImportanceFilter('')
                  setTagsFilter([])
                }}
              >
                Réinitialiser tous les filtres
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section Regroupement */}
        <Accordion sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-group-line text-primary' />
              Regroupement des données
              {(groupBy1 || groupBy2 || groupBy3) && (
                <Chip
                  label={`${[groupBy1, groupBy2, groupBy3].filter(Boolean).length} niveau${[groupBy1, groupBy2, groupBy3].filter(Boolean).length > 1 ? 'x' : ''}`}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  Organisez vos données en groupes hiérarchiques jusqu'à 3 niveaux
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant='caption' display='block' sx={{ mb: 1 }}>Regrouper par</Typography>
                <FormControl size='small' fullWidth>
                  <Select
                    displayEmpty
                    value={groupBy1}
                    onChange={(e) => setGroupBy1(e.target.value)}
                    renderValue={(value) => {
                      if (value === '') return 'Aucun regroupement'
                      return groupingOptions.find(opt => opt.value === value)?.label || value
                    }}
                  >
                    {groupingOptions.map((option) => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                        sx={option.disabled ? { 
                          fontStyle: 'italic', 
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          textAlign: 'center'
                        } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant='caption' display='block' sx={{ mb: 1 }}>Puis par</Typography>
                <FormControl size='small' fullWidth>
                  <Select
                    displayEmpty
                    value={groupBy2}
                    onChange={(e) => setGroupBy2(e.target.value)}
                    disabled={!groupBy1}
                    renderValue={(value) => {
                      if (value === '') return 'Aucun sous-regroupement'
                      return groupingOptions.find(opt => opt.value === value)?.label || value
                    }}
                  >
                    {groupingOptions
                      .filter(opt => opt.value !== groupBy1) // Éviter la duplication
                      .map((option) => (
                        <MenuItem 
                          key={option.value} 
                          value={option.value}
                          disabled={option.disabled}
                          sx={option.disabled ? { 
                            fontStyle: 'italic', 
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            textAlign: 'center'
                          } : {}}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant='caption' display='block' sx={{ mb: 1 }}>Puis par</Typography>
                <FormControl size='small' fullWidth>
                  <Select
                    displayEmpty
                    value={groupBy3}
                    onChange={(e) => setGroupBy3(e.target.value)}
                    disabled={!groupBy2}
                    renderValue={(value) => {
                      if (value === '') return 'Aucun sous-regroupement'
                      return groupingOptions.find(opt => opt.value === value)?.label || value
                    }}
                  >
                    {groupingOptions
                      .filter(opt => opt.value !== groupBy1 && opt.value !== groupBy2) // Éviter la duplication
                      .map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Actions de regroupement */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => {
                      setGroupBy1('')
                      setGroupBy2('')
                      setGroupBy3('')
                    }}
                    disabled={!groupBy1 && !groupBy2 && !groupBy3}
                  >
                    Réinitialiser le regroupement
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
      <div className='p-5'>
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <Button
            color='secondary'
            variant='outlined'
            className='max-sm:is-full is-auto'
            startIcon={<i className='ri-upload-2-line' />}
          >
            Exporter
          </Button>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            Nouveau Projet
          </Button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {groupedData.flatData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  Aucun projet trouvé
                </td>
              </tr>
            </tbody>
          ) : groupedData.groupedData ? (
            <tbody>
              {Array.from(groupedData.groupedData.entries()).map(([key1, group1]) => (
                <React.Fragment key={key1}>
                  {/* Niveau 1 */}
                  <tr className='bg-actionHover'>
                    <td colSpan={table.getVisibleFlatColumns().length} className='px-4 py-2'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='ri-folder-line text-primary' />
                        <Typography variant='subtitle1' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getGroupDisplayElement(group1.label, groupBy1, group1.projects?.[0])}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          ({group1.count} projet{group1.count > 1 ? 's' : ''})
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                  
                  {/* Niveau 2 */}
                  {group1.children && Array.from(group1.children.entries()).map(([key2, group2]) => (
                    <React.Fragment key={`${key1}-${key2}`}>
                      <tr className='bg-action/50'>
                        <td colSpan={table.getVisibleFlatColumns().length} className='px-8 py-1'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <i className='ri-folder-2-line text-secondary' />
                            <Typography variant='subtitle2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getGroupDisplayElement(group2.label, groupBy2, group2.projects?.[0])}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              ({group2.count} projet{group2.count > 1 ? 's' : ''})
                            </Typography>
                          </Box>
                        </td>
                      </tr>
                      
                      {/* Niveau 3 */}
                      {group2.children && Array.from(group2.children.entries()).map(([key3, group3]) => (
                        <React.Fragment key={`${key1}-${key2}-${key3}`}>
                          <tr className='bg-action/25'>
                            <td colSpan={table.getVisibleFlatColumns().length} className='px-12 py-1'>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <i className='ri-file-list-line text-textSecondary' />
                                <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getGroupDisplayElement(group3.label, groupBy3, group3.projects?.[0])}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  ({group3.count} projet{group3.count > 1 ? 's' : ''})
                                </Typography>
                              </Box>
                            </td>
                          </tr>
                          {/* Projets du niveau 3 */}
                          {group3.projects.map(project => {
                            const tableRow = table.getRowModel().rows.find(row => row.original.id === project.id)
                            if (!tableRow) return null
                            return (
                              <tr key={project.id} className={classnames({ selected: tableRow.getIsSelected() }, 'pl-16')}>
                                {tableRow.getVisibleCells().map(cell => (
                                  <td key={cell.id} className='pl-16'>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                              </tr>
                            )
                          })}
                        </React.Fragment>
                      ))}
                      
                      {/* Projets du niveau 2 (si pas de niveau 3) */}
                      {!group2.children.size && group2.projects.map(project => {
                        const tableRow = table.getRowModel().rows.find(row => row.original.id === project.id)
                        if (!tableRow) return null
                        return (
                          <tr key={project.id} className={classnames({ selected: tableRow.getIsSelected() })}>
                            {tableRow.getVisibleCells().map(cell => (
                              <td key={cell.id} className='pl-12'>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  ))}
                  
                  {/* Projets du niveau 1 (si pas de niveau 2) */}
                  {!group1.children.size && group1.projects.map(project => {
                    const tableRow = table.getRowModel().rows.find(row => row.original.id === project.id)
                    if (!tableRow) return null
                    return (
                      <tr key={project.id} className={classnames({ selected: tableRow.getIsSelected() })}>
                        {tableRow.getVisibleCells().map(cell => (
                          <td key={cell.id} className='pl-8'>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default ProjectListTable