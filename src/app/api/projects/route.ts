import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        vendeur: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            color: true
          }
        },
        chiffreur: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            color: true
          }
        },
        chefProjet: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformer les données pour le format attendu par le frontend
    const transformedProjects = projects.map(project => ({
      id: project.id,
      numeroORE: project.numeroORE,
      client: project.client,
      concerne: project.concerne,
      dateDemande: project.dateDemande.toISOString(),
      delai: project.delai.toISOString(),
      imperatif: project.imperatif,
      status: project.status,
      etape: project.etape,
      vendeur: project.vendeur,
      chiffreur: project.chiffreur,
      chefDeProjet: project.chefProjet,
      prixAchat: project.prixAchat,
      marge: project.marge,
      prixVente: project.prixVente,
      importance: project.importance,
      tags: project.tags ? JSON.parse(project.tags) : []
    }))

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}