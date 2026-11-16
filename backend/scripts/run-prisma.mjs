/**
 * Führt `npx prisma …` mit geladenem DATABASE_URL aus (Repo-Root oder backend/.env).
 * Aufruf aus backend/: node scripts/run-prisma.mjs db push
 */
import '../src/env.js'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const backendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/run-prisma.mjs <prisma-args…>  e.g. db push')
  process.exit(1)
}

const child = spawn('npx', ['prisma', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: backendDir,
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 0))
