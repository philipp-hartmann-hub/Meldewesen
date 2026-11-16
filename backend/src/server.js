// server.js – HEUREKA 2.0 | A2 eMeldewesen
import './env.js'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { mockAuth } from './middleware/mockAuth.js'
import router from './routes/index.js'
import { prisma } from './prisma.js'
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))
app.use(mockAuth)
app.use('/api', router)
app.get('/health', (req, res) => res.json({ status: 'ok', projekt: 'HEUREKA 2.0 A2 eMeldewesen' }))

app.use((err, req, res, next) => {
  console.error('Fehler:', err.message)
  const msg = err.message || 'Interner Serverfehler'
  res.status(err.status || 500).json({ error: msg, message: msg })
})

app.listen(PORT, () => {
  console.log(`✅ A2-Backend läuft auf Port ${PORT}`)
  if (!prisma.benachrichtigung) {
    console.warn('⚠️  Prisma-Model „benachrichtigung“ fehlt – bitte „npm run db:generate“ und Backend neu starten.')
  }
  console.log(`   Umgebung: ${process.env.NODE_ENV || 'development'}`)
})
