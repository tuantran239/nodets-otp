import { Router } from 'express'
import {
  authUserHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  signupHandler,
  resetPasswordHandler,
  sendMailHandler,
  verifyHandler
} from '@api-v1/controllers/auth.controller'
import { authenticate, apiLimiter, validate } from '@api-v1/middlewares'
import {
  createUserSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifySchema
} from '@api-v1/validator-schema/user.schema'

const router = Router()

router.get('/', authenticate, authUserHandler)

router.get('/logout', authenticate, logoutHandler)

router.post('/verify', verifySchema, validate, verifyHandler)

router.post(
  '/reset-password',
  resetPasswordSchema,
  validate,
  resetPasswordHandler
)

router.post('/signup', createUserSchema, validate, signupHandler)

router.post('/login', loginSchema, validate, loginHandler)

router.post('/send-mail', apiLimiter, validate, sendMailHandler)

router.post(
  '/forgot-password',
  forgotPasswordSchema,
  validate,
  forgotPasswordHandler
)

export default router
