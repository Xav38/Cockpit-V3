import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Créer les rôles d'abord
  const roleVendeur = await prisma.role.create({
    data: {
      name: 'Vendeur',
      description: 'Responsable des ventes et relation client',
      level: 1
    }
  })

  const roleChiffreur = await prisma.role.create({
    data: {
      name: 'Chiffreur',
      description: 'Responsable du chiffrage des projets',
      level: 2
    }
  })

  const roleChefProjet = await prisma.role.create({
    data: {
      name: 'Chef de Projet',
      description: 'Responsable de la gestion des projets',
      level: 3
    }
  })

  // Créer quelques utilisateurs de test avec les couleurs du thème Materialize
  const vendeur1 = await prisma.user.create({
    data: {
      email: 'jean.dupont@company.com',
      name: 'Jean Dupont',
      initials: 'JD',
      color: '#666CFF', // Primary Main
      roleId: roleVendeur.id
    }
  })

  const vendeur2 = await prisma.user.create({
    data: {
      email: 'pierre.durand@company.com', 
      name: 'Pierre Durand',
      initials: 'PD',
      color: '#72E128', // Success Main
      roleId: roleVendeur.id
    }
  })

  const chiffreur1 = await prisma.user.create({
    data: {
      email: 'marie.martin@company.com',
      name: 'Marie Martin',
      initials: 'MM',
      color: '#FDB528', // Warning Main
      roleId: roleChiffreur.id
    }
  })

  const chiffreur2 = await prisma.user.create({
    data: {
      email: 'luc.moreau@company.com',
      name: 'Luc Moreau',
      initials: 'LM',
      color: '#26C6F9', // Info Main
      roleId: roleChiffreur.id
    }
  })

  const chef1 = await prisma.user.create({
    data: {
      email: 'paul.mercier@company.com',
      name: 'Paul Mercier',
      initials: 'PM',
      color: '#FF4D49', // Error Main
      roleId: roleChefProjet.id
    }
  })

  // Créer des projets de test
  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00001',
      client: 'Entreprise ABC',
      concerne: 'Signalétique bureau',
      dateDemande: new Date('2024-01-15'),
      delai: new Date('2024-02-15'),
      imperatif: true,
      status: 'en_cours',
      etape: 'chiffrage',
      vendeurId: vendeur1.id,
      chiffreurId: chiffreur1.id,
      chefProjetId: chef1.id,
      prixAchat: 1625.50,
      prixVente: 2500.75,
      marge: 35.3,
      importance: 2,
      tags: JSON.stringify(['Signalétique', 'Bureau'])
    }
  })

  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00002',
      client: 'Société XYZ',
      concerne: 'Kakémonos événement',
      dateDemande: new Date('2024-01-20'),
      delai: new Date('2024-03-01'),
      imperatif: false,
      status: 'nouveau',
      etape: 'maquette',
      vendeurId: vendeur2.id,
      chiffreurId: null,
      chefProjetId: null,
      prixAchat: null,
      prixVente: null,
      marge: null,
      importance: 1,
      tags: JSON.stringify(['Kakémono', 'Événement'])
    }
  })

  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00003',
      client: 'SARL Innovation',
      concerne: 'Habillage véhicule',
      dateDemande: new Date('2024-01-10'),
      delai: new Date('2024-01-30'),
      imperatif: true,
      status: 'termine',
      etape: 'termine',
      vendeurId: vendeur1.id,
      chiffreurId: chiffreur2.id,
      chefProjetId: chef1.id,
      prixAchat: 2610.25,
      prixVente: 4500.90,
      marge: 42.7,
      importance: 3,
      tags: JSON.stringify(['Véhicule', 'Habillage', 'Flocage'])
    }
  })

  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00004',
      client: 'Tech Solutions',
      concerne: 'Stand salon professionnel',
      dateDemande: new Date('2024-02-01'),
      delai: new Date('2024-03-15'),
      imperatif: false,
      status: 'en_cours',
      etape: 'gestion_de_projet',
      vendeurId: vendeur2.id,
      chiffreurId: chiffreur1.id,
      chefProjetId: chef1.id,
      prixAchat: 3200.80,
      prixVente: 5000.15,
      marge: 36.4,
      importance: 3,
      tags: JSON.stringify(['Stand', 'Salon', 'Mobilier'])
    }
  })

  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00005',
      client: 'Restaurant Le Gourmand',
      concerne: 'Menu et supports marketing',
      dateDemande: new Date('2024-02-05'),
      delai: new Date('2024-02-20'),
      imperatif: true,
      status: 'bloque',
      etape: 'en_attente_retour_client',
      vendeurId: vendeur1.id,
      chiffreurId: chiffreur2.id,
      chefProjetId: null,
      prixAchat: 850.75,
      prixVente: 1200.50,
      marge: 29.6,
      importance: 2,
      tags: JSON.stringify(['Menu', 'Impression', 'Restaurant'])
    }
  })

  // Créer plus de projets pour tester la pagination
  const statuses = ['nouveau', 'en_cours', 'termine', 'annule', 'bloque']
  const etapes = ['maquette', 'plans_techniques', 'chiffrage', 'validation_chiffrage', 'en_attente_retour_client', 'validation_client', 'gestion_de_projet', 'production', 'termine', 'annule']
  const clients = ['Entreprise Alpha', 'Société Beta', 'Groupe Gamma', 'Corporation Delta', 'Studio Epsilon', 'Agence Zeta', 'Boutique Eta', 'Commerce Theta', 'Service Iota', 'Industrie Kappa']
  const concernes = ['Brochure publicitaire', 'Site web vitrine', 'Application mobile', 'Identité visuelle', 'Packaging produit', 'Stand salon', 'Catalogue produit', 'Vidéo corporate', 'Support formation', 'Interface utilisateur']

  for (let i = 6; i <= 100; i++) {
    // Alternance entre 2024 (24) et 2025 (25) pour plus de diversité
    const year = i % 2 === 0 ? '24' : '25'
    await prisma.project.create({
      data: {
        numeroORE: `ORE-${year}-${i.toString().padStart(5, '0')}`,
        client: clients[Math.floor(Math.random() * clients.length)],
        concerne: concernes[Math.floor(Math.random() * concernes.length)],
        dateDemande: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        delai: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        imperatif: Math.random() > 0.7,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        etape: etapes[Math.floor(Math.random() * etapes.length)],
        vendeurId: Math.random() > 0.5 ? vendeur1.id : vendeur2.id,
        chiffreurId: Math.random() > 0.5 ? chiffreur1.id : chiffreur2.id,
        chefProjetId: Math.random() > 0.3 ? chef1.id : null,
        prixAchat: Math.round((Math.random() * 5000 + 500) * 100) / 100,
        prixVente: null,
        marge: Math.round((Math.random() * 50 + 10) * 10) / 10,
        importance: Math.floor(Math.random() * 3) + 1,
        tags: JSON.stringify(['Tag1', 'Tag2'].slice(0, Math.floor(Math.random() * 2) + 1))
      }
    })
  }

  console.log('100 projets de test créés avec succès')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })