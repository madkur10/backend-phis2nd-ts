import moment from "moment-timezone";

const dateNow = (date?: any) => {
    let now;
    if (date) {
        now = moment
            .tz(date, "Asia/Jakarta")
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    } else {
        now = moment.tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    return now;
};

const formatTanggalLokal = (dateStr: any) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const locale = "id-ID";

    const date = new Date(dateStr);
    let formattedDate = date.toLocaleDateString(locale, options);

    const daysMap: { [key: string]: string } = {
        Senin: "Senin",
        Selasa: "Selasa",
        Rabu: "Rabu",
        Kamis: "Kamis",
        Jumat: "Jum'at",
        Sabtu: "Sabtu",
        Minggu: "Minggu",
    };

    Object.keys(daysMap).forEach((day) => {
        formattedDate = formattedDate.replace(day, daysMap[day]);
    });

    return formattedDate;
};

export { dateNow, formatTanggalLokal };
