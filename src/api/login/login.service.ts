import { loginUser } from "./login.repository";
import bcrypt from "bcrypt";

export const getLoginUser = async (data: any) => {
    const username = typeof data === "string" ? data : data.username;
    const password = typeof data === "string" ? undefined : data.password;

    const user: any = await loginUser(username);
    if (!user) {
        return false;
    }

    if (password !== undefined) {
        const dbPassword = user.user_password || "";
        let isPasswordValid = false;

        // Check if database password is a bcrypt hash
        if (dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2a$")) {
            isPasswordValid = await bcrypt.compare(password, dbPassword);
        } else {
            isPasswordValid = (password === dbPassword);
        }

        if (!isPasswordValid) {
            return false;
        }
    }
    
    return user;
};
