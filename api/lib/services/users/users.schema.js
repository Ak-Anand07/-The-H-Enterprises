"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userQueryResolver = exports.userQueryValidator = exports.userQuerySchema = exports.userPatchResolver = exports.userPatchValidator = exports.userPatchSchema = exports.userDataResolver = exports.userDataValidator = exports.userDataSchema = exports.userExternalResolver = exports.userResolver = exports.userValidator = exports.userSchema = void 0;
const schema_1 = require("@feathersjs/schema");
const typebox_1 = require("@feathersjs/typebox");
const validators_1 = require("../../validators");
exports.userSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    email: typebox_1.Type.String(),
    name: typebox_1.Type.String(),
    googleId: typebox_1.Type.Optional(typebox_1.Type.String()),
    avatar: typebox_1.Type.Optional(typebox_1.Type.String()),
    password: typebox_1.Type.Optional(typebox_1.Type.String())
}, { $id: 'UserBase', additionalProperties: false });
exports.userValidator = (0, typebox_1.getValidator)(exports.userSchema, validators_1.dataValidator);
exports.userResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.userExternalResolver = (0, schema_1.resolve)({
    properties: {
        password: async () => undefined
    }
});
// 2. Data for creating a new user
exports.userDataSchema = typebox_1.Type.Object({
    email: typebox_1.Type.String(),
    name: typebox_1.Type.String(),
    googleId: typebox_1.Type.Optional(typebox_1.Type.String()),
    avatar: typebox_1.Type.Optional(typebox_1.Type.String()),
    password: typebox_1.Type.Optional(typebox_1.Type.String())
}, { $id: 'UserCreationData', additionalProperties: false });
exports.userDataValidator = (0, typebox_1.getValidator)(exports.userDataSchema, validators_1.dataValidator);
exports.userDataResolver = (0, schema_1.resolve)({
    properties: {}
});
// 3. Data for patching a user
exports.userPatchSchema = typebox_1.Type.Object({
    email: typebox_1.Type.Optional(typebox_1.Type.String()),
    name: typebox_1.Type.Optional(typebox_1.Type.String()),
    googleId: typebox_1.Type.Optional(typebox_1.Type.String()),
    avatar: typebox_1.Type.Optional(typebox_1.Type.String()),
    password: typebox_1.Type.Optional(typebox_1.Type.String())
}, { $id: 'UserUpdateData', additionalProperties: false });
exports.userPatchValidator = (0, typebox_1.getValidator)(exports.userPatchSchema, validators_1.dataValidator);
exports.userPatchResolver = (0, schema_1.resolve)({
    properties: {}
});
// 4. Schema for allowed query parameters
exports.userQuerySchema = typebox_1.Type.Object({
    id: typebox_1.Type.Optional(typebox_1.Type.Number()),
    email: typebox_1.Type.Optional(typebox_1.Type.String()),
    name: typebox_1.Type.Optional(typebox_1.Type.String()),
    googleId: typebox_1.Type.Optional(typebox_1.Type.String()),
    $limit: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $skip: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $sort: typebox_1.Type.Optional(typebox_1.Type.Object({}, { additionalProperties: typebox_1.Type.Number() })),
    $select: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String()))
}, { additionalProperties: false });
exports.userQueryValidator = (0, typebox_1.getValidator)(exports.userQuerySchema, validators_1.queryValidator);
exports.userQueryResolver = (0, schema_1.resolve)({
    properties: {}
});
//# sourceMappingURL=users.schema.js.map