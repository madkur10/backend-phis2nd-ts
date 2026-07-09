import { PrismaClient as PrismaClientDb1 } from './../../prisma/generated/client-db1';
import { PrismaClient as PrismaClientDb2 } from './../../prisma/generated/client-db2';
import { PrismaClient as PrismaClientDb3 } from './../../prisma/generated/client-db3';
import { PrismaClient as PrismaClientDb4 } from './../../prisma/generated/client-db4';

const globalForPrisma = globalThis as unknown as {
    prismaDb1?: PrismaClientDb1;
    prismaDb2?: PrismaClientDb2;
    prismaDb3?: PrismaClientDb3;
    prismaDb4?: PrismaClientDb4;
};

const prismaDb1 = globalForPrisma.prismaDb1 ?? new PrismaClientDb1();
const prismaDb2 = globalForPrisma.prismaDb2 ?? new PrismaClientDb2();
const prismaDb3 = globalForPrisma.prismaDb3 ?? new PrismaClientDb3();
const prismaDb4 = globalForPrisma.prismaDb4 ?? new PrismaClientDb4();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaDb1 = prismaDb1;
    globalForPrisma.prismaDb2 = prismaDb2;
    globalForPrisma.prismaDb3 = prismaDb3;
    globalForPrisma.prismaDb4 = prismaDb4;
}

const registerLoggingMiddleware = (client: any, dbName: string) => {
    client.$use(async (params: any, next: any) => {
        const action = `${params.model ?? 'RawQuery'}.${params.action}`;
        console.log(`[${dbName}] 📡 Mengeksekusi: ${action}`);
        const startTime = Date.now();
        try {
            const result = await next(params);
            return result;
        } finally {
            const duration = Date.now() - startTime;
            console.log(`[${dbName}] 🔌 Selesai (${duration}ms).`);
        }
    });
};

registerLoggingMiddleware(prismaDb1, 'DB1');
registerLoggingMiddleware(prismaDb2, 'DB2');
registerLoggingMiddleware(prismaDb3, 'DB3');
registerLoggingMiddleware(prismaDb4, 'DB4');

const disconnectAll = async () => {
    console.log('🔌 Disconnecting all Prisma Clients...');
    await Promise.allSettled([
        prismaDb1.$disconnect(),
        prismaDb2.$disconnect(),
        prismaDb3.$disconnect(),
        prismaDb4.$disconnect(),
    ]);
    console.log('✅ All Prisma Clients disconnected.');
};

export { prismaDb1, prismaDb2, prismaDb3, prismaDb4, disconnectAll };
