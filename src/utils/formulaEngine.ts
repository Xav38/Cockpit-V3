import { Formula, FormulaContext, ValidationResult, FormulaField } from '../types/formula';

export class FormulaEngine {
  private context: FormulaContext;

  constructor(context: FormulaContext) {
    this.context = context;
  }

  // Parse une expression et extrait les références aux champs
  parseExpression(expression: string): string[] {
    const fieldPattern = /@(ligne|position|global)(?:\[([^\]]+)\])?\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const dependencies: string[] = [];
    let match;

    while ((match = fieldPattern.exec(expression)) !== null) {
      dependencies.push(match[0]);
    }

    return dependencies;
  }

  // Valide une formule
  validateFormula(expression: string, currentFieldPath?: string): ValidationResult {
    try {
      // Vérifier si l'expression est vide
      if (!expression || expression.trim() === '') {
        return { isValid: true };
      }

      const dependencies = this.parseExpression(expression);
      
      // Vérifier les références manquantes
      const missingReferences: string[] = [];
      for (const dep of dependencies) {
        if (this.resolveFieldReference(dep) === null) {
          missingReferences.push(dep);
        }
      }

      // Vérifier les dépendances circulaires
      const circularDependencies = this.detectCircularDependencies(
        currentFieldPath, 
        dependencies
      );

      // Vérifier si l'expression semble incomplète
      const isIncompleteExpression = this.isExpressionIncomplete(expression);
      
      // Ne tenter d'évaluer l'expression que s'il n'y a pas de références manquantes ET que l'expression semble complète
      if (missingReferences.length > 0) {
        return {
          isValid: false,
          error: `Références manquantes: ${missingReferences.join(', ')}`,
          missingReferences
        };
      }

      if (circularDependencies.length > 0) {
        return {
          isValid: false,
          error: `Dépendances circulaires détectées: ${circularDependencies.join(' → ')}`,
          circularDependencies
        };
      }

      if (isIncompleteExpression) {
        return {
          isValid: false,
          error: "Expression incomplète"
        };
      }

      // Tenter d'évaluer l'expression
      try {
        const result = this.evaluateExpression(expression);
        if (isNaN(result) || !isFinite(result)) {
          return {
            isValid: false,
            error: "L'expression ne produit pas un nombre valide"
          };
        }
        return { isValid: true };
      } catch (evalError: any) {
        return {
          isValid: false,
          error: `Erreur d'évaluation: ${evalError.message}`
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        error: `Erreur de validation: ${error.message}`
      };
    }
  }

  // Évalue une expression et retourne le résultat numérique
  evaluateExpression(expression: string): number {
    if (!expression || expression.trim() === '') {
      return 0;
    }

    // Remplacer les références par leurs valeurs
    let processedExpression = expression;
    const dependencies = this.parseExpression(expression);
    
    for (const dep of dependencies) {
      const value = this.resolveFieldReference(dep);
      if (value !== null) {
        processedExpression = processedExpression.replace(
          new RegExp(dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          value.toString()
        );
      } else {
        throw new Error(`Référence non trouvée: ${dep}`);
      }
    }

    // Évaluer l'expression mathématique de base
    try {
      return this.safeEval(processedExpression);
    } catch (error) {
      throw new Error(`Erreur d'évaluation: ${error}`);
    }
  }

  // Résout une référence de champ vers sa valeur numérique
  private resolveFieldReference(reference: string): number | null {
    const match = reference.match(/@(ligne|position|global)(?:\[([^\]]+)\])?\.([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (!match) return null;

    const [, scope, index, fieldName] = match;

    try {
      switch (scope) {
        case 'ligne':
          if (index) {
            const ligne = this.context.lignes.get(index);
            return ligne ? (ligne[fieldName] || 0) : 0;
          }
          return 0;

        case 'position':
          if (index) {
            const position = this.context.positions.get(index);
            return position ? (position[fieldName] || 0) : 0;
          }
          return 0;

        case 'global':
          return this.context.global ? (this.context.global[fieldName] || 0) : 0;

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Détecte les dépendances circulaires
  private detectCircularDependencies(currentFieldPath?: string, dependencies: string[] = []): string[] {
    if (!currentFieldPath) return [];

    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];

    const hasCycle = (field: string): boolean => {
      if (stack.has(field)) {
        // Cycle détecté
        const cycleStart = path.indexOf(field);
        return cycleStart !== -1;
      }

      if (visited.has(field)) {
        return false;
      }

      visited.add(field);
      stack.add(field);
      path.push(field);

      // Pour simplifier, on ne vérifie que les dépendances directes
      for (const dep of dependencies) {
        if (dep === currentFieldPath) {
          return true;
        }
      }

      stack.delete(field);
      path.pop();
      return false;
    };

    if (hasCycle(currentFieldPath)) {
      return path;
    }

    return [];
  }

  // Vérifie si une expression semble incomplète
  private isExpressionIncomplete(expression: string): boolean {
    const trimmed = expression.trim();
    
    // Vérifier les caractères de fin qui suggèrent une expression incomplète
    const incompleteEndings = ['+', '-', '*', '/', '(', '.', ','];
    if (incompleteEndings.some(ending => trimmed.endsWith(ending))) {
      return true;
    }

    // Vérifier les parenthèses non équilibrées
    let openParens = 0;
    for (const char of trimmed) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
    }
    
    return openParens !== 0;
  }

  // Évaluation sécurisée d'expressions mathématiques simples
  private safeEval(expression: string): number {
    // Nettoyer l'expression
    const cleaned = expression.replace(/\s+/g, '');
    
    // Vérifier que l'expression ne contient que des caractères autorisés
    const allowedPattern = /^[0-9+\-*/().\s]*$/;
    if (!allowedPattern.test(cleaned)) {
      throw new Error('Expression contient des caractères non autorisés');
    }

    // Utiliser Function constructor pour une évaluation plus sûre que eval()
    try {
      const func = new Function('return ' + cleaned);
      const result = func();
      
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Résultat non numérique');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Erreur d'évaluation: ${error}`);
    }
  }

  // Met à jour le contexte
  updateContext(context: FormulaContext): void {
    this.context = context;
  }
}

// Fonction utilitaire pour créer les champs disponibles
export function createAvailableFields(projectData: any): FormulaField[] {
  const fields: FormulaField[] = [];

  // Champs globaux du projet
  fields.push({
    id: 'global.commissionAgence',
    label: 'Commission agence (%)',
    path: '@global.commissionAgence',
    type: 'number',
    category: 'global',
    description: 'Pourcentage de commission agence'
  });

  fields.push({
    id: 'global.projectManagement',
    label: 'Gestion projet (%)',
    path: '@global.projectManagement',
    type: 'number',
    category: 'global',
    description: 'Pourcentage de gestion de projet'
  });

  // Champs des positions
  if (projectData.positions) {
    projectData.positions.forEach((position: any, posIndex: number) => {
      const positionId = `pos${posIndex + 1}`;
      
      fields.push({
        id: `position.${positionId}.quantite`,
        label: `Position ${posIndex + 1} - Quantité`,
        path: `@position[${positionId}].quantite`,
        type: 'number',
        category: 'position',
        description: `Quantité de la position ${position.titre || posIndex + 1}`
      });

      // Champs des lignes
      if (position.lignesChiffrage) {
        position.lignesChiffrage.forEach((ligne: any, ligneIndex: number) => {
          const ligneId = `${positionId}_L${ligneIndex + 1}`;
          
          fields.push({
            id: `ligne.${ligneId}.prixUnitAchat`,
            label: `L${ligneIndex + 1} - Prix unit. achat`,
            path: `@ligne[${ligneId}].prixUnitAchat`,
            type: 'number',
            category: 'ligne',
            description: `Prix unitaire d'achat - ${ligne.descriptif || 'Ligne ' + (ligneIndex + 1)}`
          });

          fields.push({
            id: `ligne.${ligneId}.quantite`,
            label: `L${ligneIndex + 1} - Quantité`,
            path: `@ligne[${ligneId}].quantite`,
            type: 'number',
            category: 'ligne',
            description: `Quantité - ${ligne.descriptif || 'Ligne ' + (ligneIndex + 1)}`
          });

          fields.push({
            id: `ligne.${ligneId}.totalAchat`,
            label: `L${ligneIndex + 1} - Total achat`,
            path: `@ligne[${ligneId}].totalAchat`,
            type: 'calculated',
            category: 'ligne',
            description: `Total achat - ${ligne.descriptif || 'Ligne ' + (ligneIndex + 1)}`
          });
        });
      }
    });
  }

  return fields;
}