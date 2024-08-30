import { requestAxios } from "../../../utils/axiosClient";
import { environment } from "../../../utils/config";
import {
    checkTokenExist,
    insertToken,
    updateToken,
} from "./generate-token.repository";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);

interface Token {
    last_update_date: Date;
    access_token: string;
}
const checkTokenService = async () => {
    const checkToken: Token | any = await checkTokenExist();

    if (!checkToken) {
        return {
            message: "Token not found",
            code: 201,
        };
    }

    return {
        message: "Token found",
        code: 200,
        data: {
            last_update_date: checkToken.last_update_date,
            access_token: checkToken.access_token,
        },
    };
};

const generateTokenService = async () => {
    const client_id = environment.satusehat.client_id;
    const client_secret = environment.satusehat.client_secret;
    const urlAuth = environment.satusehat.url_auth;

    const xmldata = {
        client_id: client_id,
        client_secret: client_secret,
    };

    const url = `${urlAuth}/accesstoken?grant_type=client_credentials`;
    const method = "POST";
    const headersData = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const response: any = await requestAxios(headersData, url, method, xmldata);
    if (response.status === 200) {
        if (response.data.resourceType === "OperationOutcome") {
            throw new Error("Generate Token Failed");
        }

        const checkToken: Token | any = await checkTokenExist();
        if (!checkToken) {
            const insertDataToken = await insertToken(response.data);
        } else {
            const updateDataToken = await updateToken(response.data);
        }
    } else {
        throw new Error("Generate Token Failed");
    }

    return {
        message: "Generate Token Success",
        code: 200,
        data: response.data,
    };
};

export { checkTokenService, generateTokenService, checkTokenExist };
