import { PrismaClient as PrismaClientDb1 } from './../../prisma/generated/client-db1';
import { PrismaClient as PrismaClientDb2 } from './../../prisma/generated/client-db2';
import { PrismaClient as PrismaClientDb3 } from './../../prisma/generated/client-db3';
import { PrismaClient as PrismaClientDb4 } from './../../prisma/generated/client-db4';

const prismaDb1 = new PrismaClientDb1();
const prismaDb2 = new PrismaClientDb2();
const prismaDb3 = new PrismaClientDb3();
const prismaDb4 = new PrismaClientDb4();
export { prismaDb1, prismaDb2, prismaDb3, prismaDb4 };
