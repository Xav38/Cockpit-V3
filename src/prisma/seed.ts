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

  // Créer plus d'utilisateurs avec différents rôles et couleurs variées
  const vendeur1 = await prisma.user.create({
    data: {
      email: 'jean.dupont@company.com',
      name: 'Jean Dupont',
      initials: 'JD',
      color: '#666CFF' // Primary Main
    }
  })

  const vendeur2 = await prisma.user.create({
    data: {
      email: 'pierre.durand@company.com', 
      name: 'Pierre Durand',
      initials: 'PD',
      color: '#72E128' // Success Main
    }
  })

  const vendeur3 = await prisma.user.create({
    data: {
      email: 'sophie.bernard@company.com',
      name: 'Sophie Bernard',
      initials: 'SB',
      color: '#9C27B0' // Purple
    }
  })

  const chiffreur1 = await prisma.user.create({
    data: {
      email: 'marie.martin@company.com',
      name: 'Marie Martin',
      initials: 'MM',
      color: '#FDB528' // Warning Main
    }
  })

  const chiffreur2 = await prisma.user.create({
    data: {
      email: 'luc.moreau@company.com',
      name: 'Luc Moreau',
      initials: 'LM',
      color: '#26C6F9' // Info Main
    }
  })

  const chiffreur3 = await prisma.user.create({
    data: {
      email: 'alice.robert@company.com',
      name: 'Alice Robert',
      initials: 'AR',
      color: '#FF9800' // Orange
    }
  })

  const chiffreur4 = await prisma.user.create({
    data: {
      email: 'thomas.leroy@company.com',
      name: 'Thomas Leroy',
      initials: 'TL',
      color: '#795548' // Brown
    }
  })

  const chef1 = await prisma.user.create({
    data: {
      email: 'paul.mercier@company.com',
      name: 'Paul Mercier',
      initials: 'PM',
      color: '#FF4D49' // Error Main
    }
  })

  const chef2 = await prisma.user.create({
    data: {
      email: 'claire.dubois@company.com',
      name: 'Claire Dubois',
      initials: 'CD',
      color: '#E91E63' // Pink
    }
  })

  const chef3 = await prisma.user.create({
    data: {
      email: 'antoine.petit@company.com',
      name: 'Antoine Petit',
      initials: 'AP',
      color: '#3F51B5' // Indigo
    }
  })

  const chef4 = await prisma.user.create({
    data: {
      email: 'isabelle.roux@company.com',
      name: 'Isabelle Roux',
      initials: 'IR',
      color: '#00BCD4' // Cyan
    }
  })

  // Assigner les rôles aux utilisateurs via la table UserRole
  
  // Vendeurs uniquement
  await prisma.userRole.create({ data: { userId: vendeur1.id, roleId: roleVendeur.id } })
  await prisma.userRole.create({ data: { userId: vendeur2.id, roleId: roleVendeur.id } })
  await prisma.userRole.create({ data: { userId: vendeur3.id, roleId: roleVendeur.id } })

  // Chiffreurs uniquement
  await prisma.userRole.create({ data: { userId: chiffreur2.id, roleId: roleChiffreur.id } })
  await prisma.userRole.create({ data: { userId: chiffreur3.id, roleId: roleChiffreur.id } })

  // Chefs de projet uniquement
  await prisma.userRole.create({ data: { userId: chef3.id, roleId: roleChefProjet.id } })
  await prisma.userRole.create({ data: { userId: chef4.id, roleId: roleChefProjet.id } })

  // Utilisateurs multi-rôles
  // Marie Martin: Chiffreur ET Chef de projet
  await prisma.userRole.create({ data: { userId: chiffreur1.id, roleId: roleChiffreur.id } })
  await prisma.userRole.create({ data: { userId: chiffreur1.id, roleId: roleChefProjet.id } })

  // Thomas Leroy: Chiffreur ET Chef de projet
  await prisma.userRole.create({ data: { userId: chiffreur4.id, roleId: roleChiffreur.id } })
  await prisma.userRole.create({ data: { userId: chiffreur4.id, roleId: roleChefProjet.id } })

  // Paul Mercier: Chef de projet ET Chiffreur
  await prisma.userRole.create({ data: { userId: chef1.id, roleId: roleChefProjet.id } })
  await prisma.userRole.create({ data: { userId: chef1.id, roleId: roleChiffreur.id } })

  // Claire Dubois: Chef de projet ET Chiffreur
  await prisma.userRole.create({ data: { userId: chef2.id, roleId: roleChefProjet.id } })
  await prisma.userRole.create({ data: { userId: chef2.id, roleId: roleChiffreur.id } })

  // Créer des projets de test avec des scénarios multi-rôles
  // Scénario 1: Marie Martin est chiffreur sur ce projet
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
      chiffreurId: chiffreur1.id, // Marie Martin en tant que chiffreur
      chefProjetId: chef1.id,
      prixAchat: 1625.50,
      prixVente: 2500.75,
      marge: 35.3,
      importance: 2,
      tags: JSON.stringify(['Signalétique', 'Bureau'])
    }
  })

  // Scénario 2: Marie Martin est chef de projet sur ce projet (même personne, rôle différent)
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
      vendeurId: vendeur3.id,
      chiffreurId: chiffreur2.id, // Luc Moreau comme chiffreur
      chefProjetId: chiffreur1.id, // Marie Martin comme chef de projet (même personne que projet 1)
      prixAchat: null,
      prixVente: null,
      marge: null,
      importance: 1,
      tags: JSON.stringify(['Kakémono', 'Événement'])
    }
  })

  // Scénario 3: Paul Mercier est chef de projet sur ce projet
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
      vendeurId: vendeur2.id,
      chiffreurId: chiffreur3.id, // Alice Robert comme chiffreur
      chefProjetId: chef1.id, // Paul Mercier comme chef de projet
      prixAchat: 2610.25,
      prixVente: 4500.90,
      marge: 42.7,
      importance: 3,
      tags: JSON.stringify(['Véhicule', 'Habillage', 'Flocage'])
    }
  })

  // Scénario 4: Paul Mercier est chiffreur sur ce projet (même personne que projet 3, rôle différent)
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
      vendeurId: vendeur1.id,
      chiffreurId: chef1.id, // Paul Mercier comme chiffreur (même personne que projet 3)
      chefProjetId: chef3.id, // Antoine Petit comme chef de projet
      prixAchat: 3200.80,
      prixVente: 5000.15,
      marge: 36.4,
      importance: 3,
      tags: JSON.stringify(['Stand', 'Salon', 'Mobilier'])
    }
  })

  // Scénario 5: Thomas Leroy peut aussi être chef de projet
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
      vendeurId: vendeur3.id,
      chiffreurId: chiffreur1.id, // Marie Martin comme chiffreur
      chefProjetId: chiffreur4.id, // Thomas Leroy comme chef de projet (normalement chiffreur)
      prixAchat: 850.75,
      prixVente: 1200.50,
      marge: 29.6,
      importance: 2,
      tags: JSON.stringify(['Menu', 'Impression', 'Restaurant'])
    }
  })

  // Scénario 6: Claire Dubois peut être chiffreur
  await prisma.project.create({
    data: {
      numeroORE: 'ORE-24-00006',
      client: 'Boutique Mode',
      concerne: 'Vitrine et PLV',
      dateDemande: new Date('2024-02-10'),
      delai: new Date('2024-03-05'),
      imperatif: false,
      status: 'en_cours',
      etape: 'chiffrage',
      vendeurId: vendeur2.id,
      chiffreurId: chef2.id, // Claire Dubois comme chiffreur (normalement chef de projet)
      chefProjetId: chef4.id, // Isabelle Roux comme chef de projet
      prixAchat: 1450.30,
      prixVente: 2100.45,
      marge: 31.2,
      importance: 2,
      tags: JSON.stringify(['Vitrine', 'PLV', 'Mode'])
    }
  })

  // Créer plus de projets pour tester la pagination
  const statuses = ['nouveau', 'en_cours', 'termine', 'annule', 'bloque']
  const etapes = ['maquette', 'plans_techniques', 'chiffrage', 'validation_chiffrage', 'en_attente_retour_client', 'validation_client', 'gestion_de_projet', 'production', 'termine', 'annule']
  const clients = ['Entreprise Alpha', 'Société Beta', 'Groupe Gamma', 'Corporation Delta', 'Studio Epsilon', 'Agence Zeta', 'Boutique Eta', 'Commerce Theta', 'Service Iota', 'Industrie Kappa']
  const concernes = ['Brochure publicitaire', 'Site web vitrine', 'Application mobile', 'Identité visuelle', 'Packaging produit', 'Stand salon', 'Catalogue produit', 'Vidéo corporate', 'Support formation', 'Interface utilisateur']

  // Créer des arrays d'utilisateurs pour faciliter l'assignation aléatoire
  const vendeurs = [vendeur1, vendeur2, vendeur3]
  const chiffreurs = [chiffreur1, chiffreur2, chiffreur3, chiffreur4]
  const chefs = [chef1, chef2, chef3, chef4]
  
  // Ajouter des personnes multi-rôles pour démontrer la flexibilité
  const multiRoleUsers = [
    chiffreur1, // Marie Martin peut être chiffreur ou chef de projet
    chiffreur4, // Thomas Leroy peut être chiffreur ou chef de projet
    chef1,      // Paul Mercier peut être chef de projet ou chiffreur
    chef2       // Claire Dubois peut être chef de projet ou chiffreur
  ]
  
  // Étendre les arrays pour inclure les utilisateurs multi-rôles
  const extendedChiffreurs = [...chiffreurs, chef1, chef2] // Ajouter des chefs qui peuvent être chiffreurs
  const extendedChefs = [...chefs, chiffreur1, chiffreur4] // Ajouter des chiffreurs qui peuvent être chefs

  for (let i = 7; i <= 100; i++) {
    // Alternance entre 2024 (24) et 2025 (25) pour plus de diversité
    const year = i % 2 === 0 ? '24' : '25'
    
    // Assignation plus réaliste avec différents patterns
    const hasVendeur = Math.random() > 0.1 // 90% des projets ont un vendeur
    const hasChiffreur = Math.random() > 0.2 // 80% des projets ont un chiffreur
    const hasChef = Math.random() > 0.4 // 60% des projets ont un chef
    
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
        vendeurId: hasVendeur ? vendeurs[Math.floor(Math.random() * vendeurs.length)].id : null,
        chiffreurId: hasChiffreur ? extendedChiffreurs[Math.floor(Math.random() * extendedChiffreurs.length)].id : null,
        chefProjetId: hasChef ? extendedChefs[Math.floor(Math.random() * extendedChefs.length)].id : null,
        prixAchat: Math.round((Math.random() * 5000 + 500) * 100) / 100,
        prixVente: null,
        marge: Math.round((Math.random() * 50 + 10) * 10) / 10,
        importance: Math.floor(Math.random() * 3) + 1,
        tags: JSON.stringify(['Tag1', 'Tag2'].slice(0, Math.floor(Math.random() * 2) + 1))
      }
    })
  }

  console.log('100 projets de test créés avec succès')
  console.log('')
  console.log('=== UTILISATEURS ET LEURS RÔLES ===')
  console.log('Vendeurs uniquement:')
  console.log('- Jean Dupont, Pierre Durand, Sophie Bernard')
  console.log('')
  console.log('Chiffreurs uniquement:')
  console.log('- Luc Moreau, Alice Robert')
  console.log('')
  console.log('Chefs de projet uniquement:')
  console.log('- Antoine Petit, Isabelle Roux')
  console.log('')
  console.log('MULTI-RÔLES (Chiffreur ET Chef de projet):')
  console.log('- Marie Martin (peut être assignée comme chiffreur OU chef de projet)')
  console.log('- Thomas Leroy (peut être assigné comme chiffreur OU chef de projet)')
  console.log('- Paul Mercier (peut être assigné comme chiffreur OU chef de projet)')
  console.log('- Claire Dubois (peut être assignée comme chiffreur OU chef de projet)')
  console.log('')
  console.log('Les menus déroulants afficheront tous les utilisateurs avec leurs rôles associés.')
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