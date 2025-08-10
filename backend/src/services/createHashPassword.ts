import bcrypt from "bcrypt"
export const createHashedPassword = async (password: string): Promise<string> => {
    const saltRounds = 12
    return await bcrypt.hash(password,saltRounds)
}