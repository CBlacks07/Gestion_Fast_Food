import prisma from './prisma';
import type { ActivityType } from '@prisma/client';

interface LogActivityParams {
  type: ActivityType;
  userId?: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Log une activité de manière sécurisée
 * Si la table n'existe pas encore, le log est ignoré silencieusement
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        type: params.type,
        userId: params.userId || null,
        targetId: params.targetId || null,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error: any) {
    // Si la table n'existe pas (erreur Prisma P2021 ou erreur SQL),
    // on ignore silencieusement pour ne pas bloquer l'application
    if (
      error.code === 'P2021' || // Prisma: table does not exist
      error.message?.includes('relation') && error.message?.includes('does not exist') ||
      error.message?.includes('activity_logs')
    ) {
      // Table pas encore créée, on ignore
      return;
    }

    // Pour les autres erreurs, on log mais on ne fait pas planter
    console.error('Erreur lors du logging d\'activité:', error.message || error);
  }
}

/**
 * Vérifie si le système de logging est disponible
 */
export async function isActivityLogAvailable(): Promise<boolean> {
  try {
    await prisma.activityLog.findFirst({ take: 1 });
    return true;
  } catch (error) {
    return false;
  }
}
