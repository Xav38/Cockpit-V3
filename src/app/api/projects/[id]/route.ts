import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Valider que l'ID du projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    })
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }
    
    // Mettre à jour seulement les champs fournis
    const updatedProject = await prisma.project.update({
      where: { id },
      data: body,
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
    
    // Transformer les données pour le format attendu par le frontend
    const transformedProject = {
      id: updatedProject.id,
      numeroORE: updatedProject.numeroORE,
      client: updatedProject.client,
      concerne: updatedProject.concerne,
      dateDemande: updatedProject.dateDemande.toISOString(),
      delai: updatedProject.delai.toISOString(),
      imperatif: updatedProject.imperatif,
      status: updatedProject.status,
      etape: updatedProject.etape,
      vendeur: updatedProject.vendeur,
      chiffreur: updatedProject.chiffreur,
      chefDeProjet: updatedProject.chefProjet,
      prixAchat: updatedProject.prixAchat,
      marge: updatedProject.marge,
      prixVente: updatedProject.prixVente,
      importance: updatedProject.importance,
      tags: updatedProject.tags ? JSON.parse(updatedProject.tags) : []
    }
    
    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    )
  }
}