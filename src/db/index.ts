import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const prismaRawQuery = Prisma;

export { prisma, prismaRawQuery };
