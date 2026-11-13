
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("githubAccount:", typeof prisma.githubAccount);
console.log("user:", typeof prisma.user);
console.log("project:", typeof prisma.project);
console.log("gitHubAccount:", typeof prisma.gitHubAccount);
await prisma.$disconnect();
