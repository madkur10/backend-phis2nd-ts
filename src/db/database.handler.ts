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

const selectField = async (
    tableName: string,
    field: string | any,
    conditions: string | any
) => {
    const rawQuery = `SELECT
                        ${field}
                    FROM
                        ${tableName}
                        ${conditions}
                    Limit 1`;
    const selectDataField: any = await prisma.$queryRawUnsafe(rawQuery);

    return selectDataField[0][field];
};

const timeHandler = async (timex: any) => {
    const time = new Date(timex);
    const hours = time.getUTCHours().toString().padStart(2, "0");
    const minutes = time.getUTCMinutes().toString().padStart(2, "0");
    const seconds = time.getUTCSeconds().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime;
};

export { generateMax, selectField, timeHandler };
