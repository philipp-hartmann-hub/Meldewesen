/**
 * Gemeinsame Prisma-Instanz (ein Client pro Prozess).
 * Erneuert den Client automatisch, wenn nach Schema-Änderung das Model fehlt
 * (typisch bei node --watch ohne vollständigen Neustart).
 */
import './env.js'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function neuerClient() {
  return new PrismaClient()
}

let prisma = globalForPrisma.prisma

if (!prisma || typeof prisma.benachrichtigung === 'undefined') {
  prisma = neuerClient()
  globalForPrisma.prisma = prisma
}

export { prisma }
