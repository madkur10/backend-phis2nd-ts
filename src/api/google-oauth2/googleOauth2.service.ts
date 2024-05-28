import { getEmail } from "./googleOauth2.repository";

const getCheckEmail = async (email: string) => {
    const user: any = await getEmail(email);
    if (!user) {
        return null;
    }
    return user;
};

export { getCheckEmail };
