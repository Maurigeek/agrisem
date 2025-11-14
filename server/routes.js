"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
async function registerRoutes(app) {
    // put application routes here
    // prefix all routes with /api
    // use storage to perform CRUD operations on the storage interface
    // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
