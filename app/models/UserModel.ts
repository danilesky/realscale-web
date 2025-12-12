import { Expose, Transform, Type } from 'class-transformer'
import { ApiModel } from './ApiModel'

export class UserModel extends ApiModel {
  readonly endpoint = 'users'

  @Expose()
  declare id: string

  @Expose()
  declare email: string

  @Expose()
  declare name: string

  @Expose()
  declare role: string

  @Expose()
  declare avatar: string | null | undefined

  @Expose()
  declare emailVerified: boolean | undefined

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  declare createdAt: Date | undefined

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined), { toClassOnly: true })
  declare updatedAt: Date | undefined

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
