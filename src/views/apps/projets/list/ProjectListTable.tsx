'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

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

type ProjectDataType = {
  id: string
  numeroORE: string
  dateDemande: string
  client: string
  concerne: string
  delai: string
  etape: string
  status: string
  vendeur: { name: string; initials: string; color: string } | null
  chiffreur: { name: string; initials: string; color: string } | null
  chefDeProjet: { name: string; initials: string; color: string } | null
  prixAchat: number | null
  marge: number | null
  prixVente: number | null
  importance: number
  tags: string[]
  imperatif: boolean
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
      // Vous pourriez ajouter une notification d'erreur ici
    } finally {
      setLoading(null)
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
          <Chip
            label={row.original.etape.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            color={getEtapeColor(row.original.etape)}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i 
              className={classnames('ri-circle-fill text-xs', {
                'text-info': row.original.status === 'nouveau',
                'text-primary': row.original.status === 'en_cours', 
                'text-success': row.original.status === 'termine',
                'text-error': row.original.status === 'annule',
                'text-warning': row.original.status === 'bloque'
              })} 
            />
            <Typography color='text.primary' className='capitalize'>
              {row.original.status.replace('_', ' ')}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('vendeur', {
        header: 'Vendeur',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getUserAvatar(row.original.vendeur)}
            <Typography color='text.primary'>
              {row.original.vendeur?.name || 'Non assigné'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('chiffreur', {
        header: 'Chiffreur',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getUserAvatar(row.original.chiffreur)}
            <Typography color='text.primary'>
              {row.original.chiffreur?.name || 'Non assigné'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('chefDeProjet', {
        header: 'Chef de projet',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getUserAvatar(row.original.chefDeProjet)}
            <Typography color='text.primary'>
              {row.original.chefDeProjet?.name || 'Non assigné'}
            </Typography>
          </div>
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
        header: 'Importance',
        cell: ({ row }) => (
          <Rating
            value={row.original.importance}
            readOnly
            size='small'
            max={3}
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
    [data, loading, handleImperatifChange, formatPrice, formatMarge, getUserAvatar]
  )

  const table = useReactTable({
    data,
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
      <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Rechercher un projet'
          className='max-sm:is-full'
        />
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
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  Aucun projet trouvé
                </td>
              </tr>
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