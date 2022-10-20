import { AuthType, Role } from '@api-v1/types'
import { model, Schema, Document } from 'mongoose'
import { hash, compare } from 'bcrypt'
import { UserStatus } from '@api-v1/types/user.type'

export interface UserDocument extends Document {
  name: string
  email: string
  password: string
  authType: AuthType
  role: string
  avatar: {
    url: string
    public_id: string | null
  }
  status: string
  createdAt: Date
  updatedAt: Date
  comparePassword: (password: string) => boolean
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    password: {
      type: String,
      required: true
    },
    authType: {
      type: String,
      enum: {
        values: [AuthType.EMAIL, AuthType.GOOGLE],
        message: '{VALUE} is not supported'
      },
      default: AuthType.EMAIL
    },
    role: {
      type: String,
      enum: {
        values: [Role.USER, Role.ADMIN],
        message: '{VALUE} is not supported'
      },
      default: Role.USER
    },
    avatar: {
      url: String,
      public_id: String
    },
    status: {
      type: String,
      enum: {
        values: [UserStatus.ACTIVE, UserStatus.BLOCK],
        message: '{VALUE} is not supported'
      },
      default: UserStatus.BLOCK
    }
  },
  {
    timestamps: true
  }
)

userSchema.methods.comparePassword = async function (password: string) {
  const user = this
  return await compare(password, user.password)
}

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await hash(user.password, 8)
  }
  next()
})

const User = model<UserDocument>('User', userSchema)

export default User
