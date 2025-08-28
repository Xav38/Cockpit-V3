'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ProjectListTable from './ProjectListTable'

const ProjectList = ({ projectData = [] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProjectListTable projectData={projectData} />
      </Grid>
    </Grid>
  )
}

export default ProjectList