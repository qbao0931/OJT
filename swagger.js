const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OJT API",
      version: "1.0.0",
      description: "API documentation for OJT project",
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: "Local server" },
      { url: "https://ten-app.onrender.com", description: "Render server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "./routes/*.js")], // ✅ fix absolute path
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Debug log
  console.log("Swagger docs loaded ✅, check at: http://localhost:" + PORT + "/api-docs");
  console.log("👉 Loaded APIs from:", path.join(__dirname, "./routes/*.js"));
};
