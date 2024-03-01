import { loginUser } from "./login.repository";

export const getLoginUser = async (loginUserData: any) => {
    const user: any = await loginUser(loginUserData);
    if (user.length < 1) {
        return false;
    }
    return user;
};
