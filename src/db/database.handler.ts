import { prisma, prismaRawQuery } from "./index";

const generateMax = async (
    sequenceName: string,
    field?: string | any,
    conditions?: string | any
) => {
    const queryCheckSequence = `
        select
            sequence_name
        from
            information_schema.sequences
        where
            sequence_name = '${sequenceName}';`;
    const sequenceCheck: any = await prisma.$queryRawUnsafe(queryCheckSequence);

    let generateMax;
    if (sequenceCheck.length === 0) {
        const rawQuery = `
            SELECT 
                COALESCE(MAX(${field})+1, 1) as maxid
            FROM
                ${sequenceName}
                ${conditions};`;
        const sequenceCheck: any = await prisma.$queryRawUnsafe(rawQuery);

        generateMax = parseInt(sequenceCheck[0].maxid.toString());
    } else {
        const rawQuery = prismaRawQuery.sql`
            SELECT 
                nextval(${sequenceName})`;
        const generate: any = await prisma.$queryRaw(rawQuery);

        generateMax = parseInt(generate[0].nextval.toString());
    }

    return generateMax;
};

export { generateMax };
