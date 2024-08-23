import { PrismaClient as PrismaClientDb1 } from './../../prisma/generated/client-db1';
import { PrismaClient as PrismaClientDb2 } from './../../prisma/generated/client-db2';
import { PrismaClient as PrismaClientDb3 } from './../../prisma/generated/client-db3';

const prismaDb1 = new PrismaClientDb1();
const prismaDb2 = new PrismaClientDb2();
const prismaDb3 = new PrismaClientDb3();

export { prismaDb1, prismaDb2, prismaDb3 };
