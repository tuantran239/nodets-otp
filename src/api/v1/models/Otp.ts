import { model, Schema, Document } from 'mongoose'
import { hash, compare, genSalt } from 'bcrypt'

export interface OtpDocument extends Document {
  otp: string
  email: string
  date: any
  compareOtp: (otp: string) => boolean
}

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: new Date().toISOString(),
    index: {
      expires: 3600 * 24
    }
  }
})

// otpSchema.index({ time: 1 }, { expires: 3600 * 24 })

otpSchema.methods.compareOtp = async function (otp: string) {
  const OTP = this
  return await compare(otp, OTP.otp)
}

otpSchema.pre('save', async function (next) {
  const OTP = this
  if (OTP.isModified('otp')) {
    const salt = await genSalt(10)
    OTP.otp = await hash(OTP.otp, salt)
  }
  next()
})

const Otp = model<OtpDocument>('Otp', otpSchema)

export default Otp
