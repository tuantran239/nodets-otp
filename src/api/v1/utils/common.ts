import GenOtp from 'otp-generator'
import { hash, compare, genSalt } from 'bcrypt'

export const generateAvatarUrl = (name: string) =>
  `https://avatars.dicebear.com/api/jdenticon/${name}.svg`

export const generateOtp = (num: number) =>
  GenOtp.generate(num, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false
  })

export const getTime = () => Date.now()

export const hashCode = async (otp: any) => {
  const salt = await genSalt(10)
  return await hash(otp, salt)
}
