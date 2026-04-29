"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
const authentication_1 = require("@feathersjs/authentication");
const authentication_local_1 = require("@feathersjs/authentication-local");
const authentication_oauth_1 = require("@feathersjs/authentication-oauth");
const authentication = (app) => {
    class GoogleStrategy extends authentication_oauth_1.OAuthStrategy {
        async authenticate(authentication, params) {
            const profile = await this.getProfile(authentication, params);
            const email = typeof profile.email === 'string'
                ? profile.email
                : Array.isArray(profile.emails) && typeof profile.emails[0]?.value === 'string'
                    ? profile.emails[0].value
                    : null;
            const profileId = profile.sub || profile.id;
            if (!profileId) {
                throw new Error('Google profile is missing an identity (sub or id)');
            }
            const idField = this.entityService.id || 'id';
            // 1. Try to find by googleId
            const googleUsers = await this.entityService.find({
                query: { googleId: profileId, $limit: 1 }
            });
            const googleUser = (googleUsers.data?.[0] || googleUsers[0]);
            let result;
            if (googleUser) {
                result = await this.updateEntity(googleUser, profile, params);
            }
            else if (email) {
                const emailUsers = await this.entityService.find({
                    query: { email, $limit: 1 }
                });
                const emailUser = (emailUsers.data?.[0] || emailUsers[0]);
                if (emailUser) {
                    result = await this.updateEntity(emailUser, profile, params);
                }
            }
            if (!result) {
                result = await this.createEntity(profile, params);
            }
            return result;
        }
        async getEntityData(profile, existingEntity) {
            const email = typeof profile.email === 'string'
                ? profile.email
                : Array.isArray(profile.emails) && typeof profile.emails[0]?.value === 'string'
                    ? profile.emails[0].value
                    : null;
            const name = typeof profile.name === 'string'
                ? profile.name
                : typeof profile.displayName === 'string'
                    ? profile.displayName
                    : typeof profile.given_name === 'string'
                        ? profile.given_name
                        : 'Google User';
            const picture = typeof profile.picture === 'string'
                ? profile.picture
                : Array.isArray(profile.photos) && typeof profile.photos[0]?.value === 'string'
                    ? profile.photos[0].value
                    : undefined;
            return {
                ...(await super.getEntityData(profile, existingEntity, {})),
                email: email ?? existingEntity?.email,
                name,
                avatar: picture
            };
        }
    }
    const authentication = new authentication_1.AuthenticationService(app);
    // Ensure 'sub' claim in JWT matches the user ID
    const originalGetPayload = authentication.getPayload.bind(authentication);
    authentication.getPayload = async (authResult, params) => {
        const payload = await originalGetPayload(authResult, params);
        const idField = authentication.configuration.entityId || 'id';
        if (authResult && authResult[idField]) {
            payload.sub = String(authResult[idField]);
        }
        return payload;
    };
    authentication.register('jwt', new authentication_1.JWTStrategy());
    authentication.register('local', new authentication_local_1.LocalStrategy());
    authentication.register('google', new GoogleStrategy());
    app.use('authentication', authentication);
    app.configure((0, authentication_oauth_1.oauth)());
};
exports.authentication = authentication;
//# sourceMappingURL=authentication.js.map