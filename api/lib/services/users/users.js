"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const schema_1 = require("@feathersjs/schema");
const authentication_1 = require("@feathersjs/authentication");
const authentication_local_1 = require("@feathersjs/authentication-local");
const users_schema_1 = require("./users.schema");
const users_class_1 = require("./users.class");
const user = (app) => {
    app.use('users', new users_class_1.UserService((0, users_class_1.getOptions)(app)), {
        methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
        events: []
    });
    const authenticateExternal = [
        async (context, next) => {
            if (context.params.provider) {
                return authentication_1.hooks.authenticate('jwt')(context, next);
            }
            return next();
        }
    ];
    app.service('users').hooks({
        around: {
            all: [schema_1.hooks.resolveExternal(users_schema_1.userExternalResolver), schema_1.hooks.resolveResult(users_schema_1.userResolver)],
            find: [...authenticateExternal],
            get: [...authenticateExternal],
            create: [],
            update: [...authenticateExternal],
            patch: [...authenticateExternal],
            remove: [...authenticateExternal]
        },
        before: {
            all: [
                schema_1.hooks.validateQuery(users_schema_1.userQueryValidator),
                schema_1.hooks.resolveQuery(users_schema_1.userQueryResolver)
            ],
            find: [],
            get: [],
            create: [
                schema_1.hooks.validateData(users_schema_1.userDataValidator),
                schema_1.hooks.resolveData(users_schema_1.userDataResolver),
                authentication_local_1.hooks.hashPassword('password')
            ],
            patch: [
                schema_1.hooks.validateData(users_schema_1.userPatchValidator),
                schema_1.hooks.resolveData(users_schema_1.userPatchResolver),
                authentication_local_1.hooks.hashPassword('password')
            ],
            remove: []
        },
        after: {
            all: []
        },
        error: {
            all: []
        }
    });
};
exports.user = user;
//# sourceMappingURL=users.js.map