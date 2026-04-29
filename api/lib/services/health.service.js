"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
class HealthService {
    async get(_id, _params) {
        return {
            status: 'ok',
            service: 'api',
            timestamp: new Date().toISOString()
        };
    }
}
exports.healthService = new HealthService();
//# sourceMappingURL=health.service.js.map