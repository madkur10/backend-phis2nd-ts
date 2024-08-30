import { prismaDb1, prismaDb2, prismaDb3 } from "./index";

const generateMaxDb1 = async (
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
    const sequenceCheck: any = await prismaDb1.$queryRawUnsafe(
        queryCheckSequence
    );

    let generateMax;
    if (sequenceCheck.length === 0) {
        const rawQuery = `
            SELECT 
                COALESCE(MAX(${field})+1, 1) as maxid
            FROM
                ${sequenceName}
                ${conditions};`;
        const sequenceCheck: any = await prismaDb1.$queryRawUnsafe(rawQuery);

        generateMax = parseInt(sequenceCheck[0].maxid.toString());
    } else {
        const rawQuery: any = await prismaDb1.$queryRaw`SELECT 
            nextval(${sequenceName}) + 1 as nextval`;

        generateMax = parseInt(rawQuery[0].nextval.toString());
    }

    return generateMax;
};

const selectFieldDb1 = async (
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
    const selectDataField: any = await prismaDb1.$queryRawUnsafe(rawQuery);

    return selectDataField[0][field];
};

const generateMaxDb2 = async (
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
    const sequenceCheck: any = await prismaDb2.$queryRawUnsafe(
        queryCheckSequence
    );

    let generateMax;
    if (sequenceCheck.length === 0) {
        const rawQuery = `
            SELECT 
                COALESCE(MAX(${field})+1, 1) as maxid
            FROM
                ${sequenceName}
                ${conditions};`;
        const sequenceCheck: any = await prismaDb2.$queryRawUnsafe(rawQuery);

        generateMax = parseInt(sequenceCheck[0].maxid.toString());
    } else {
        const rawQuery: any = await prismaDb2.$queryRaw`SELECT 
            nextval(${sequenceName}) + 1 as nextval`;

        generateMax = parseInt(rawQuery[0].nextval.toString());
    }

    return generateMax;
};

const selectFieldDb2 = async (
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
    const selectDataField: any = await prismaDb2.$queryRawUnsafe(rawQuery);

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

export {
    generateMaxDb1,
    selectFieldDb1,
    timeHandler,
    generateMaxDb2,
    selectFieldDb2,
};
