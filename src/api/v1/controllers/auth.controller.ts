import { Request, Response } from 'express'
import { serverConf } from '@config'
import {
  authEmailPassword,
  createOtp,
  deleteOtp,
  getOtp,
  updateOtp
} from '@api-v1/services/auth.service'
import { createSession, deleteSession } from '@api-v1/services/session.service'
import {
  createUser,
  getUserExist,
  updateUser
} from '@api-v1/services/user.service'
import { AuthType, UserStatus } from '@api-v1/types/user.type'
import {
  BadRequestResponse,
  CommonErrorResponse,
  generateError,
  InternalServerErrorResponse
} from '@api-v1/error/http-error'
import { HttpResponse, signJWT, generateAvatarUrl } from '@api-v1/utils'
import { sendMailWorker } from '@api-v1/worker/email-worker'
import { cookieCons, jwtCons } from '@api-v1/constants'
import { generateOtp, hashCode } from '@api-v1/utils/common'

export const signupHandler = async (req: Request, res: Response) => {
  const { error: errorExist } = await getUserExist(
    true,
    { email: req.body.email, authType: AuthType.EMAIL },
    'email'
  )
  if (errorExist) {
    return CommonErrorResponse(res, errorExist)
  }

  const body = {
    ...req.body,
    avatar: {
      public_id: null,
      url: generateAvatarUrl(req.body.name)
    }
  }
  const { error, data: user } = await createUser(body)
  if (error) {
    return CommonErrorResponse(res, error)
  }

  const OTP = generateOtp(6)
  await Promise.all([
    sendMailWorker({
      email: user?.email as string,
      otp: OTP
    }),
    createOtp({ otp: OTP, email: user?.email as string })
  ])

  return HttpResponse(res, 201, {
    success: true,
    email: user?.email as string
  })
}

export const sendMailHandler = async (req: Request, res: Response) => {
  const { email } = req.body

  const OTP = generateOtp(6)
  const hashOTP = await hashCode(OTP)

  await Promise.all([
    sendMailWorker({
      email: email as string,
      otp: OTP
    }),
    updateOtp({ email }, { otp: hashOTP })
  ])

  return HttpResponse(res, 200, { success: true })
}

export const verifyHandler = async (req: Request, res: Response) => {
  const { otp, email } = req.body

  const { data: userOtp } = await getOtp({ email })
  if (!userOtp) {
    return BadRequestResponse(res, generateError('Otp', 'Otp expire'))
  }

  const isMatch = await userOtp?.compareOtp(otp)
  if (!isMatch) {
    return BadRequestResponse(res, generateError('Otp', 'Otp not match'))
  }

  await Promise.all([
    updateUser({ email }, { status: UserStatus.ACTIVE }),
    deleteOtp({ email })
  ])

  return HttpResponse(res, 200, { success: true })
}

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const { data: user, error } = await authEmailPassword(email, password)
  if (error) {
    return CommonErrorResponse(res, error)
  }

  await deleteSession({ user: user?._id })
  const { data: session, error: errorSession } = await createSession({
    user: user?._id
  })
  if (errorSession) {
    return InternalServerErrorResponse(res, errorSession.error)
  }

  const objJwt = { userId: user?._id, sessionId: session?._id }
  const accessToken = signJWT(objJwt, { expiresIn: jwtCons.timeAccessToken })
  const refreshToken = signJWT(objJwt, { expiresIn: jwtCons.timeRefeshToken })
  res.cookie('access', accessToken, {
    maxAge: cookieCons.timeCookieAccessToken,
    httpOnly: true
  })
  res.cookie('refresh', refreshToken, {
    maxAge: cookieCons.timeCookieRefeshToken,
    httpOnly: true
  })

  return HttpResponse(res, 200, { success: true })
}

export const loginSocialHandler = async (req: any, res: Response) => {
  const user = req.user

  await deleteSession({ user: user?._id })
  const { data: session, error: errorSession } = await createSession({
    user: user?._id
  })
  if (errorSession) {
    return InternalServerErrorResponse(res, errorSession.error)
  }

  const objJwt = { userId: user?._id, sessionId: session?._id }
  const accessToken = signJWT(objJwt, { expiresIn: jwtCons.timeAccessToken })
  const refreshToken = signJWT(objJwt, { expiresIn: jwtCons.timeRefeshToken })
  res.cookie('access', accessToken, {
    maxAge: cookieCons.timeCookieAccessToken,
    httpOnly: true
  })
  res.cookie('refresh', refreshToken, {
    maxAge: cookieCons.timeCookieRefeshToken,
    httpOnly: true
  })

  res.redirect(serverConf.clientUrl)
}

export const authUserHandler = async (req: Request, res: Response) => {
  const user = res.locals.user
  return HttpResponse(res, 200, { user })
}

export const logoutHandler = async (req: Request, res: Response) => {
  const user = res.locals.user
  res.clearCookie('access')
  res.clearCookie('refresh')
  await deleteSession({ user: user._id })
  return HttpResponse(res, 200, { success: true })
}

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { email } = req.body

  const { error: errorExist, data: user } = await getUserExist(false, {
    email,
    authType: AuthType.EMAIL
  })
  if (errorExist) {
    return BadRequestResponse(res, errorExist.error)
  }

  const OTP = generateOtp(6)
  await Promise.all([
    sendMailWorker({
      email: user?.email as string,
      otp: OTP
    }),
    createOtp({ otp: OTP, email: user?.email as string })
  ])

  return HttpResponse(res, 200, {
    success: true,
    email: user?.email as string
  })
}

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { otp, email, password } = req.body

  const { data: userOtp } = await getOtp({ email })
  if (!userOtp) {
    return BadRequestResponse(res, generateError('Otp', 'Otp expire'))
  }

  const isMatch = await userOtp?.compareOtp(otp)
  if (!isMatch) {
    return BadRequestResponse(res, generateError('Otp', 'Otp not match'))
  }

  const hashPassword = await hashCode(password)
  await Promise.all([
    updateUser({ email }, { password: hashPassword }),
    deleteOtp({ email })
  ])

  return HttpResponse(res, 200, { success: true })
}
