"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const envFilePath = node_path_1.default.resolve(__dirname, '../.env');
if (typeof node_process_1.default.loadEnvFile === 'function' && node_fs_1.default.existsSync(envFilePath)) {
    node_process_1.default.loadEnvFile(envFilePath);
}
// Load the app only after environment variables are available to Feathers configuration.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('./app');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { logger } = require('./logger');
const port = app.get('port');
const host = app.get('host');
node_process_1.default.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason));
app.listen(port).then(() => {
    logger.info(`Feathers app listening on http://${host}:${port}`);
});
//# sourceMappingURL=index.js.map