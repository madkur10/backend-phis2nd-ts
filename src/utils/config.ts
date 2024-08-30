import dotenv from "dotenv";

dotenv.config();

export const environment = {
    nodeEnv: process.env.NODE_ENV || "dev",
    port: parseInt(process.env.PORT || "3000", 10),
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    timezone: process.env.TZ || "Asia/Jakarta",
    satusehat: {
        url_auth: (process.env.NODE_ENV === "dev") ? process.env.urlAuthSatuSehatDev : process.env.urlAuthSatuSehat,
        url_base: (process.env.NODE_ENV === "dev") ? process.env.urlBaseSatuSehatDev : process.env.urlBaseSatuSehat,
        client_id: (process.env.NODE_ENV === "dev") ? process.env.clientIdSatuSehatDev : process.env.clientIdSatuSehat,
        client_secret: (process.env.NODE_ENV === "dev") ? process.env.clientSecretSatuSehatDev : process.env.clientSecretSatuSehat,
        org_id: (process.env.NODE_ENV === "dev") ? process.env.OrganizationIDDev : process.env.OrganizationID,
    },
};
