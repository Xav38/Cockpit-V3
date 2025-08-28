import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    // Récupérer tous les utilisateurs avec leurs rôles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        initials: true,
        color: true,
        roles: {
          include: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Créer des utilisateurs pour chaque rôle avec indication des rôles multiples
    const vendeurs = allUsers
      .filter(user => user.roles.some(ur => ur.role.name === 'Vendeur'))
      .map(user => ({
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
        roles: user.roles.map(ur => ur.role.name)
      }))

    const chiffreurs = allUsers
      .filter(user => user.roles.some(ur => ur.role.name === 'Chiffreur'))
      .map(user => ({
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
        roles: user.roles.map(ur => ur.role.name)
      }))

    const chefsDeProjet = allUsers
      .filter(user => user.roles.some(ur => ur.role.name === 'Chef de Projet'))
      .map(user => ({
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
        roles: user.roles.map(ur => ur.role.name)
      }))

    // Définir les options statiques pour statuts et étapes
    const statuts = [
      { value: 'nouveau', label: 'Nouveau', color: 'info' },
      { value: 'en_cours', label: 'En cours', color: 'primary' },
      { value: 'termine', label: 'Terminé', color: 'success' },
      { value: 'annule', label: 'Annulé', color: 'error' },
      { value: 'bloque', label: 'Bloqué', color: 'warning' }
    ]

    const etapes = [
      { value: 'maquette', label: 'Maquette', color: 'info' },
      { value: 'plans_techniques', label: 'Plans techniques', color: 'primary' },
      { value: 'chiffrage', label: 'Chiffrage', color: 'warning' },
      { value: 'validation_chiffrage', label: 'Validation chiffrage', color: 'secondary' },
      { value: 'en_attente_retour_client', label: 'En attente retour client', color: 'warning' },
      { value: 'validation_client', label: 'Validation client', color: 'success' },
      { value: 'gestion_de_projet', label: 'Gestion de projet', color: 'primary' },
      { value: 'production', label: 'Production', color: 'info' },
      { value: 'termine', label: 'Terminé', color: 'success' },
      { value: 'annule', label: 'Annulé', color: 'error' }
    ]

    return NextResponse.json({
      vendeurs,
      chiffreurs,
      chefsDeProjet,
      statuts,
      etapes
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des options' },
      { status: 500 }
    )
  }
}