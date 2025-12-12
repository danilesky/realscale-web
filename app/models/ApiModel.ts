import 'reflect-metadata'
import {
  plainToInstance,
  instanceToPlain,
  type ClassConstructor,
  type ClassTransformOptions,
} from 'class-transformer'

export abstract class ApiModel {
  abstract readonly endpoint: string
  abstract readonly id: string

  $endpoint(detail = false) {
    const base = `/api/${this.endpoint}`

    return detail ? `${base}/${this.id}` : base
  }

  constructor(object?: object) {
    if (object) {
      Object.assign(this, plainToInstance(this.constructor as ClassConstructor<this>, object, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true,
      }))
    }
  }

  static toModel<T extends ApiModel>(
    this: ClassConstructor<T>,
    object: object,
    options: ClassTransformOptions = { excludeExtraneousValues: false, enableImplicitConversion: true },
  ) {
    return plainToInstance(this, object, options)
  }

  static toArray<T extends ApiModel>(
    this: ClassConstructor<T>,
    objects: object[],
    options: ClassTransformOptions = { excludeExtraneousValues: false, enableImplicitConversion: true },
  ) {
    return plainToInstance(this, objects, options)
  }

  toPlain(options: ClassTransformOptions = { excludeExtraneousValues: false }) {
    return instanceToPlain(this, options)
  }

  clone<T extends ApiModel>(
    this: T,
    options: ClassTransformOptions = { excludeExtraneousValues: false, enableImplicitConversion: true },
  ) {
    const constructor = this.constructor as ClassConstructor<T>

    return plainToInstance(constructor, instanceToPlain(this), options)
  }
}
