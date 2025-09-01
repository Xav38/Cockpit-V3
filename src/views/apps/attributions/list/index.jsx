'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AttributionsTable from './AttributionsTable'

const AttributionsList = ({ projectData = [] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AttributionsTable projectData={projectData} />
      </Grid>
    </Grid>
  )
}

export default AttributionsList