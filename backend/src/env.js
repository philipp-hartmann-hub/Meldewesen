/**
 * Lädt Umgebungsvariablen für Backend, Seed und Prisma-CLI-Hilfsskripte.
 * Reihenfolge: zuerst Repo-Root `.env`, dann `backend/.env` (überschreibt bei Kollision).
 * Bereits gesetzte Variablen (z. B. Docker) werden von der ersten Datei nicht überschrieben;
 * `backend/.env` darf mit override: true gezielt überschreiben (lokale Overrides).
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.join(__dirname, '..')
const repoDir = path.join(__dirname, '../..')

// Docker setzt DATABASE_URL vor dem Start – nicht durch backend/.env (localhost) überschreiben
const databaseUrlFromRuntime = process.env.DATABASE_URL

dotenv.config({ path: path.join(repoDir, '.env') })
dotenv.config({ path: path.join(backendDir, '.env'), override: true })

if (databaseUrlFromRuntime) {
  process.env.DATABASE_URL = databaseUrlFromRuntime
}
