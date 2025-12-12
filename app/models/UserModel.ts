import { Expose, Transform, Type } from 'class-transformer'
import { ApiModel } from './ApiModel'

export class UserModel extends ApiModel {
  @Expose()
  id!: string

  @Expose()
  email!: string

  @Expose()
  name!: string

  @Expose()
  role!: string

  @Expose()
  avatar?: string | null

  @Expose()
  emailVerified?: boolean

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  createdAt?: Date

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  updatedAt?: Date

  get initials() {
    return this.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  get isAdmin() {
    return this.role === 'admin'
  }

  get displayName() {
    return this.name || this.email.split('@')[0]
  }
}

