const express = require("express");
const configureMiddleware = require("./src/configs/middleware");
const configureErrorHandler = require("./src/middlewares/errorHandler");
const configureRoutes = require("./src/routing/routes");

const app = express();

configureMiddleware(app);
configureRoutes(app);
configureErrorHandler(app);

module.exports = app;
