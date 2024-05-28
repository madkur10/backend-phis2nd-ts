import { loginUser } from "./login.repository";

export const getLoginUser = async (username: string) => {
    const user: any = await loginUser(username);
    if (!user) {
        return false;
    }

    return user;
};
