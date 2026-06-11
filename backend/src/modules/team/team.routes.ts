import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { authenticated, authenticatedAdmin, authenticatedOwner } from '../../middleware/auth.middleware.js'
import { inviteSchema, acceptInviteSchema, changeRoleSchema } from './team.validator.js'
import * as teamService from './team.service.js'
import type { UserRole } from '@prisma/client'

const router: ReturnType<typeof Router> = Router()

// GET /api/team
router.get('/', ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await teamService.getMembers(req.tenantId!)
    res.json({ data: members })
  } catch (err) {
    next(err)
  }
})

// POST /api/team/invite
router.post('/invite', ...authenticatedAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = inviteSchema.parse(req.body)
    const result = await teamService.inviteUser({
      email: body.email,
      role: body.role as UserRole,
      tenantId: req.tenantId!,
      inviterName: req.user!.email,
      inviterId: req.user!.sub,
    })
    res.status(201).json({ data: result })
  } catch (err) {
    next(err)
  }
})

// GET /api/team/invite/:token — public
router.get('/invite/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params['token'] as string
    const details = await teamService.getInviteDetails(token)
    res.json({ data: details })
  } catch (err) {
    next(err)
  }
})

// POST /api/team/accept-invite — public
router.post('/accept-invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = acceptInviteSchema.parse(req.body)
    const result = await teamService.acceptInvite(body)
    res.status(201).json({ data: result })
  } catch (err) {
    next(err)
  }
})

// PUT /api/team/members/:userId/role
router.put('/members/:userId/role', ...authenticatedAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params['userId'] as string
    const { role } = changeRoleSchema.parse(req.body)
    await teamService.changeRole(req.tenantId!, userId, role as UserRole, req.user!.sub)
    res.json({ data: { message: 'Role updated' } })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/team/members/:userId
router.delete('/members/:userId', ...authenticatedOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params['userId'] as string
    await teamService.removeMember(req.tenantId!, userId, req.user!.sub)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as teamRouter }
