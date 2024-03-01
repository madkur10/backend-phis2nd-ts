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

export { dateNow };
