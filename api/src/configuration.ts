import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from './validators'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    origins: Type.Union([Type.Array(Type.String()), Type.String()]),
    authentication: Type.Object({
      secret: Type.String(),
      oauth: Type.Object({
        redirect: Type.String(),
        origins: Type.Union([Type.Array(Type.String()), Type.String()]),
        google: Type.Object({
          key: Type.String(),
          secret: Type.String()
        })
      })
    }),
    mysql: Type.Any()
  })
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
