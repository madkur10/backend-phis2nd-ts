import { loginUser } from "./login.repository";

export const getLoginUser = async (data: any) => {
    const user: any = await loginUser(data);
    if (!user) {
        return false;
    }
    
    return user;
};
