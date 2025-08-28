import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    // Récupérer les utilisateurs par rôle
    const [vendeurs, chiffreurs, chefsDeProjet] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: {
            name: 'Vendeur'
          }
        },
        select: {
          id: true,
          name: true,
          initials: true,
          color: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.user.findMany({
        where: {
          role: {
            name: 'Chiffreur'
          }
        },
        select: {
          id: true,
          name: true,
          initials: true,
          color: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.user.findMany({
        where: {
          role: {
            name: 'Chef de Projet'
          }
        },
        select: {
          id: true,
          name: true,
          initials: true,
          color: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ])

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