'use client'

import { useState, useEffect } from 'react'

export default function TestProjetsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des projets')
        }
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) return <div style={{padding: '20px'}}>Chargement des projets...</div>
  if (error) return <div style={{padding: '20px', color: 'red'}}>Erreur: {error}</div>

  return (
    <div style={{padding: '20px'}}>
      <h1>Test - Liste des Projets (Données de la base)</h1>
      <p>Nombre de projets: {projects.length}</p>
      
      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
        <thead>
          <tr style={{backgroundColor: '#f5f5f5'}}>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>N° ORE</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Client</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Concerne</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Date demande</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Délai</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Status</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Étape</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Vendeur</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Chiffreur</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Chef de projet</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Prix vente</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Marge</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Importance</th>
            <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td style={{border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: '#1976d2'}}>
                {project.numeroORE}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>{project.client}</td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>{project.concerne}</td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {new Date(project.dateDemande).toLocaleDateString('fr-FR')}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  {new Date(project.delai).toLocaleDateString('fr-FR')}
                  {project.imperatif && (
                    <span style={{
                      backgroundColor: '#f44336', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '12px', 
                      fontSize: '12px'
                    }}>
                      Impératif
                    </span>
                  )}
                </div>
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 
                      project.status === 'nouveau' ? '#2196f3' :
                      project.status === 'en_cours' ? '#ff9800' :
                      project.status === 'termine' ? '#4caf50' :
                      project.status === 'annule' ? '#f44336' :
                      project.status === 'bloque' ? '#ff5722' : '#9e9e9e'
                  }}></span>
                  {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                </div>
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: 
                    project.etape === 'maquette' ? '#e3f2fd' :
                    project.etape === 'chiffrage' ? '#fff3e0' :
                    project.etape === 'termine' ? '#e8f5e8' : '#f5f5f5',
                  color: 
                    project.etape === 'maquette' ? '#1976d2' :
                    project.etape === 'chiffrage' ? '#f57c00' :
                    project.etape === 'termine' ? '#388e3c' : '#666'
                }}>
                  {project.etape.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {project.vendeur?.name || 'Non assigné'}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {project.chiffreur?.name || 'Non assigné'}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {project.chefDeProjet?.name || 'Non assigné'}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px', fontWeight: 'bold'}}>
                {project.prixVente ? 
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(project.prixVente) 
                  : '-'
                }
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {project.marge ? `${project.marge}%` : '-'}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {'★'.repeat(project.importance)}{'☆'.repeat(3-project.importance)}
              </td>
              <td style={{border: '1px solid #ddd', padding: '8px'}}>
                {project.tags && project.tags.length > 0 ? (
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                    {project.tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: '2px 6px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop: '30px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px'}}>
        <h3>✅ Intégration base de données réussie !</h3>
        <p><strong>Ce que nous avons accompli :</strong></p>
        <ul>
          <li>✅ API route <code>/api/projects</code> fonctionnelle</li>
          <li>✅ Base de données SQLite avec Prisma</li>
          <li>✅ {projects.length} projets chargés depuis la base de données</li>
          <li>✅ Relations vendeur/chiffreur/chef de projet</li>
          <li>✅ Données formatées correctement (dates, prix, tags)</li>
          <li>✅ Tableau avec les mêmes colonnes que quotator-demo</li>
        </ul>
        <p><strong>Prochaine étape :</strong> Résoudre les erreurs de configuration Materialize pour intégrer ce tableau dans l'interface complète.</p>
      </div>
    </div>
  )
}