import { Expose, Transform, Type } from 'class-transformer'
import { ApiModel } from './api.model'
import type { AuthProvider } from '~/types/auth'

export class UserModel extends ApiModel {
  readonly endpoint = 'users'

  @Expose()
  declare id: string

  @Expose()
  declare email: string

  @Expose()
  declare firstName: string | null

  @Expose()
  declare lastName: string | null

  @Expose()
  declare avatarUrl: string | null

  @Expose()
  declare provider: AuthProvider

  @Expose()
  declare googleId: string | null

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  declare createdAt: Date

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  declare updatedAt: Date

  get fullName() {
    const parts = [this.firstName, this.lastName].filter(Boolean)

    return parts.length > 0 ? parts.join(' ') : null
  }

  get initials() {
    const name = this.fullName

    if (!name) {
      return this.email.slice(0, 2).toUpperCase()
    }

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  get displayName() {
    return this.fullName || this.email.split('@')[0]
  }

  get isGoogleUser() {
    return this.provider === 'google'
  }
}
