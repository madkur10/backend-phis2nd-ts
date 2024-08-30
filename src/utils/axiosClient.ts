import axios from "axios";

const requestAxios = async (
    headersData: any,
    url: string,
    method: string,
    xmldata: any
) => {
    try {
        let reqOptions = {};

        if (method === "POST") {
            let bodyContent;
            if (headersData["Content-Type"] === "application/json") {
                bodyContent = JSON.stringify(xmldata);
            } else {
                bodyContent = xmldata;
            }
            reqOptions = {
                url: url,
                method: method,
                headers: headersData,
                data: bodyContent,
            };
        } else {
            reqOptions = {
                url: url,
                method: method,
                headers: headersData,
            };
        }
        let response = await axios.request(reqOptions);

        return response;
    } catch (error: any) {
        return error.response;
    }
};

export { requestAxios };
