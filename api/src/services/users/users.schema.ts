import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { Type, getValidator as getTypeboxValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

export const userSchema = Type.Object(
  {
    id: Type.Number(),
    email: Type.String(),
    name: Type.String(),
    googleId: Type.Optional(Type.String()),
    avatar: Type.Optional(Type.String()),
    password: Type.Optional(Type.String())
  },
  { $id: 'UserBase', additionalProperties: false }
)
export type User = Static<typeof userSchema>
export const userValidator = getTypeboxValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext>({
  properties: {}
})

export const userExternalResolver = resolve<User, HookContext>({
  properties: {
    password: async () => undefined
  }
})

// 2. Data for creating a new user
export const userDataSchema = Type.Object(
  {
    email: Type.String(),
    name: Type.String(),
    googleId: Type.Optional(Type.String()),
    avatar: Type.Optional(Type.String()),
    password: Type.Optional(Type.String())
  },
  { $id: 'UserCreationData', additionalProperties: false }
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getTypeboxValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
  properties: {}
})

// 3. Data for patching a user
export const userPatchSchema = Type.Object(
  {
    email: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    googleId: Type.Optional(Type.String()),
    avatar: Type.Optional(Type.String()),
    password: Type.Optional(Type.String())
  },
  { $id: 'UserUpdateData', additionalProperties: false }
)
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getTypeboxValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext>({
  properties: {}
})

// 4. Schema for allowed query parameters
export const userQuerySchema = Type.Object({
  id: Type.Optional(Type.Number()),
  email: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  googleId: Type.Optional(Type.String()),
  $limit: Type.Optional(Type.Number()),
  $skip: Type.Optional(Type.Number()),
  $sort: Type.Optional(Type.Object({}, { additionalProperties: Type.Number() })),
  $select: Type.Optional(Type.Array(Type.String()))
}, { additionalProperties: false })

export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getTypeboxValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  properties: {}
})
