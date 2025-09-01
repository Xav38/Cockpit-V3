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

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Créer les données étendues en JSON pour les champs non supportés directement
    const extendedData = {
      commissionAgence: data.commissionAgence ? parseFloat(data.commissionAgence) : 0,
      description: data.description || '',
      adresseInstallation: data.adresseInstallation || '',
      contactSurPlace: data.contactSurPlace || null,
      contactClient: data.contactClient || null,
      timeline: data.timeline || null
    }
    
    // Créer le projet avec les données de base
    const newProject = await prisma.project.create({
      data: {
        numeroORE: data.numeroORE,
        client: data.nomClient,
        concerne: data.concerne || '',
        dateDemande: new Date(data.dateDemande),
        delai: data.dateInstallation ? new Date(data.dateInstallation) : new Date(),
        imperatif: false,
        status: data.status || 'nouveau',
        etape: data.etape || 'maquette',
        prixAchat: 0,
        marge: 0,
        prixVente: 0,
        importance: data.importance || 1,
        tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
        chiffrageData: JSON.stringify(extendedData),
        // Relations
        vendeurId: data.vendeur || null,
        chiffreurId: data.chiffreur || null,
        chefProjetId: data.chefDeProjet || null
      },
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
      }
    })

    return NextResponse.json(newProject)
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}