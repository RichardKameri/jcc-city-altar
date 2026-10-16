import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createAdminApp } from "./admin-app.js";
import { assertJwtSecret } from "./middleware/auth-middleware.js";

const prisma = new PrismaClient();
const jwtSecret = process.env.ADMIN_JWT_SECRET;
assertJwtSecret(jwtSecret);

const port = Number(process.env.ADMIN_API_PORT || 3100);
const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:5174";
const app = createAdminApp({ prisma, jwtSecret, adminOrigin });
const server = app.listen(port, () => {
  console.info(`Admin API listening on port ${port}; allowed origin: ${adminOrigin}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);