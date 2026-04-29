import { hooks as schemaHooks } from '@feathersjs/schema'
import { hooks as authHooks } from '@feathersjs/authentication'
import { hooks as localAuthHooks } from '@feathersjs/authentication-local'

import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema'
import type { Application } from '../../declarations'
import { UserService, getOptions } from './users.class'

export const user = (app: Application) => {
  app.use('users', new UserService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    events: []
  })

  const authenticateExternal = [
    async (context: any, next: any) => {
      if (context.params.provider) {
        return authHooks.authenticate('jwt')(context, next)
      }
      return next()
    }
  ]

  app.service('users').hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [...authenticateExternal],
      get: [...authenticateExternal],
      create: [],
      update: [...authenticateExternal],
      patch: [...authenticateExternal],
      remove: [...authenticateExternal]
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        localAuthHooks.hashPassword('password')
      ],
      patch: [
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver),
        localAuthHooks.hashPassword('password')
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    users: UserService
  }
}
