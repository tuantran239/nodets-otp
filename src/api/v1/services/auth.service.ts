import { AuthType } from '@api-v1/types'
import User from '@api-v1/models/User'
import Otp, { OtpDocument } from '@api-v1/models/Otp'
import { throwValidationError } from '@api-v1/error/mongodb-error'
import { FuncHandleService } from '@api-v1/utils/functions'
import { sendMail } from '@api-v1/utils/nodemailer'
import { UserStatus } from '@api-v1/types/user.type'
import { createDoc, deleteDoc, getDoc, updateDoc } from './db.service'
import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery
} from 'mongoose'

export const sendOTPVerify = async (email: string, otp: string) =>
  FuncHandleService('Error send link verify', async () => {
    const title = 'Verify Email'
    const content = ''
    await sendMail({ to: email }, { otp, title, content })
    return otp
  })

export const authEmailPassword = (email: string, password: string) =>
  FuncHandleService('Error auth email and password', async () => {
    const user = await User.findOne(
      { email, authType: AuthType.EMAIL },
      'email password status'
    )
    if (!user) {
      throwValidationError('email', 'email not found', true)
    }
    const isMatch = await user?.comparePassword(password)
    if (!isMatch) {
      throwValidationError('password', 'password not match', true)
    }
    if (user?.status !== UserStatus.ACTIVE) {
      throwValidationError('email', 'user not active', true)
    }
    return user
  })

export const createOtp = (body: Partial<OtpDocument>) =>
  createDoc('Error create otp', Otp, body)

export const getOtp = (
  filter?: FilterQuery<OtpDocument>,
  projection?: ProjectionType<OtpDocument> | null,
  options?: QueryOptions<OtpDocument> | null
) => getDoc('Error get Otp', Otp, filter, projection, options)

export const updateOtp = (
  filter: FilterQuery<OtpDocument>,
  update?: UpdateQuery<OtpDocument>,
  options?: QueryOptions<OtpDocument> | null
) => updateDoc('Error update Otp', Otp, filter, update, options)

export const deleteOtp = (
  filter: FilterQuery<OtpDocument>,
  options?: QueryOptions<OtpDocument> | null
) => deleteDoc('Error delete Otp', Otp, filter, options)
