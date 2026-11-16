import {
  listBenachrichtigungen,
  markiereBenachrichtigungenGelesen,
} from '../services/benachrichtigungService.js'

export function registerBenachrichtigungenRoutes(router, prisma) {
  router.get('/benachrichtigungen', async (req, res, next) => {
    try {
      const { limit } = req.query
      const result = await listBenachrichtigungen(prisma, req.mockNutzer.nutzerId, { limit })
      res.json(result)
    } catch (err) { next(err) }
  })

  router.patch('/benachrichtigungen/gelesen', async (req, res, next) => {
    try {
      const { ids } = req.body || {}
      const result = await markiereBenachrichtigungenGelesen(
        prisma,
        req.mockNutzer.nutzerId,
        { ids },
      )
      res.json(result)
    } catch (err) { next(err) }
  })
}
