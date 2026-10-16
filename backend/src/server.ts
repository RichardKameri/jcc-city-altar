import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app.js";
import { createProfileImageStorage } from "./profile-image-storage.js";

const prisma = new PrismaClient();
const profileImageStorage = createProfileImageStorage();
const app = createApp({ prisma, profileImageStorage });
const port = Number(process.env.PORT || 3000);
const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);

if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0) {
  throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
}

app.set("trust proxy", trustedProxyHops);

const server = app.listen(port, () => {
  console.info(`Public contact API listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);