/**
 * Routen für optionale Dateianhänge an Meldungen (nur Entwurf, Prototyp).
 */
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { isRichTextEmpty, stripRichTextPlain } from '../utils/richText.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BESCHREIBUNG_MAX_LAENGE = 200

function uploadRoot() {
  return path.join(__dirname, '..', '..', 'uploads', 'meldungen')
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function meldungUploadDir(meldungId) {
  const dir = path.join(uploadRoot(), meldungId)
  ensureDir(dir)
  return dir
}

export function registerMeldungAnhaengeRoutes(router, prisma) {
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      try {
        cb(null, meldungUploadDir(req.params.id))
      } catch (e) {
        cb(e, null)
      }
    },
    filename(req, file, cb) {
      const safe = `${Date.now()}-${String(file.originalname || 'datei').replace(/[^a-zA-Z0-9._\-äöüÄÖÜß ]/g, '_')}`
      cb(null, safe)
    },
  })

  const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024, files: 20 },
    fileFilter(req, file, cb) {
      const m = (file.mimetype || '').toLowerCase()
      const ok =
        m.startsWith('image/') ||
        m === 'application/pdf' ||
        m.startsWith('text/') ||
        m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        m === 'application/msword'
      if (ok) cb(null, true)
      else cb(new Error('Dateityp nicht erlaubt. Erlaubt: Bilder (JPEG, PNG), PDF, Text (.txt), Word (.doc, .docx).'))
    },
  })

  function parseBeschreibungen(body) {
    const raw = body?.beschreibungen
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(s => String(s || '').trim())
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(s => String(s || '').trim()) : []
    } catch {
      return []
    }
  }

  function validateBeschreibung(beschreibung) {
    const text = String(beschreibung || '').trim()
    if (isRichTextEmpty(text)) {
      return 'Bitte geben Sie zu jeder Datei eine Kurzbeschreibung an.'
    }
    if (stripRichTextPlain(text).length > BESCHREIBUNG_MAX_LAENGE) {
      return `Kurzbeschreibungen dürfen maximal ${BESCHREIBUNG_MAX_LAENGE} Zeichen haben.`
    }
    return null
  }

  async function loadEntwurfAnhang(meldungId, anhangId) {
    const meldung = await prisma.meldung.findUnique({ where: { id: meldungId } })
    if (!meldung) return { status: 404, message: 'Meldung nicht gefunden.' }
    if (meldung.status !== 'DRAFT') {
      return {
        status: 400,
        message: 'Anhänge können nur bei Meldungen im Status Entwurf bearbeitet werden.',
      }
    }
    const anhang = await prisma.anhang.findFirst({
      where: { id: anhangId, meldungId },
    })
    if (!anhang) return { status: 404, message: 'Anhang nicht gefunden.' }
    return { meldung, anhang }
  }

  function assertBearbeitenBerechtigung(req, res) {
    const { kannMeldungBearbeiten } = req.mockNutzer
    if (!kannMeldungBearbeiten) {
      res.status(403).json({ message: 'Keine Berechtigung zum Bearbeiten von Anhängen.' })
      return false
    }
    return true
  }

  /** Mehrere Dateien (Feldname „dateien“) */
  router.post(
    '/meldungen/:id/anhaenge',
    upload.array('dateien', 20),
    async (req, res, next) => {
      try {
        const { kannMeldungBearbeiten } = req.mockNutzer
        if (!kannMeldungBearbeiten) {
          return res.status(403).json({ message: 'Keine Berechtigung zum Hochladen von Anhängen.' })
        }
        const meldung = await prisma.meldung.findUnique({ where: { id: req.params.id } })
        if (!meldung) return res.status(404).json({ message: 'Meldung nicht gefunden.' })
        if (meldung.status !== 'DRAFT') {
          return res.status(400).json({
            message: 'Anhänge können nur bei Meldungen im Status Entwurf ergänzt werden.',
          })
        }
        const files = req.files || []
        if (!files.length) {
          return res.status(400).json({ message: 'Bitte wählen Sie mindestens eine Datei aus.' })
        }

        const beschreibungen = parseBeschreibungen(req.body)
        const created = []
        for (let i = 0; i < files.length; i++) {
          const f = files[i]
          const beschreibung = (beschreibungen[i] || '').trim()
          if (!beschreibung) {
            return res.status(400).json({
              message: 'Bitte geben Sie zu jeder Datei eine Kurzbeschreibung an.',
            })
          }
          const rel = path.relative(uploadRoot(), f.path).replace(/\\/g, '/')
          const row = await prisma.anhang.create({
            data: {
              meldungId: meldung.id,
              dateiname: f.originalname || f.filename,
              dateityp: f.mimetype || 'application/octet-stream',
              pfad: rel,
              beschreibung,
            },
          })
          created.push(row)
        }
        res.status(201).json({ data: created })
      } catch (err) {
        next(err)
      }
    },
  )

  /** Kurzbeschreibung eines gespeicherten Anhangs ändern (nur Entwurf) */
  router.patch('/meldungen/:meldungId/anhaenge/:anhangId', async (req, res, next) => {
    try {
      if (!assertBearbeitenBerechtigung(req, res)) return
      const { meldungId, anhangId } = req.params
      const loaded = await loadEntwurfAnhang(meldungId, anhangId)
      if (loaded.status) {
        return res.status(loaded.status).json({ message: loaded.message })
      }

      const beschreibung = String(req.body?.beschreibung || '').trim()
      const err = validateBeschreibung(beschreibung)
      if (err) return res.status(400).json({ message: err })

      const updated = await prisma.anhang.update({
        where: { id: anhangId },
        data: { beschreibung },
      })
      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  /** Gespeicherten Anhang entfernen (nur Entwurf) */
  router.delete('/meldungen/:meldungId/anhaenge/:anhangId', async (req, res, next) => {
    try {
      if (!assertBearbeitenBerechtigung(req, res)) return
      const { meldungId, anhangId } = req.params
      const loaded = await loadEntwurfAnhang(meldungId, anhangId)
      if (loaded.status) {
        return res.status(loaded.status).json({ message: loaded.message })
      }

      const abs = path.join(uploadRoot(), loaded.anhang.pfad)
      if (abs.startsWith(uploadRoot()) && fs.existsSync(abs)) {
        fs.unlinkSync(abs)
      }
      await prisma.anhang.delete({ where: { id: anhangId } })
      res.json({ data: { id: anhangId } })
    } catch (err) {
      next(err)
    }
  })

  /** Datei herunterladen (Mock-Auth-Header wie üblich) */
  router.get('/meldungen/:meldungId/anhaenge/:anhangId/file', async (req, res, next) => {
    try {
      const { meldungId, anhangId } = req.params
      const anhang = await prisma.anhang.findFirst({
        where: { id: anhangId, meldungId },
      })
      if (!anhang) return res.status(404).json({ message: 'Anhang nicht gefunden.' })

      const abs = path.join(uploadRoot(), anhang.pfad)
      if (!abs.startsWith(uploadRoot()) || !fs.existsSync(abs)) {
        return res.status(404).json({ message: 'Datei nicht vorhanden.' })
      }

      res.setHeader('Content-Type', anhang.dateityp || 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(anhang.dateiname)}`)
      res.sendFile(abs, err => {
        if (err && !res.headersSent) next(err)
      })
    } catch (err) {
      next(err)
    }
  })
}
