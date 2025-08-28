// Component Imports
import ProjectList from '@views/apps/projets/list'

const getProjectsData = async () => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/projects`, {
      cache: 'no-store' // Assure que les données sont toujours fraîches
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des projets')
    }
    
    const projectData = await response.json()
    return { projectData }
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error)
    // Retourner des données vides en cas d'erreur
    return { projectData: [] }
  }
}

const ProjetsListPage = async () => {
  // Vars
  const data = await getProjectsData()

  return <ProjectList projectData={data?.projectData} />
}

export default ProjetsListPage