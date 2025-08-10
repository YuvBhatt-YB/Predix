import z from "zod";

export const signUpSchema = z.object({
    username: z.string().min(3,"Username should be at least 3 characters").max(10,"Username must be most 10 characters"),
    email:z.email("Invalid email address"),
    password:z.string().min(8,"password must be at least 8 Characters")
})
export const logInSchema = z.object({
    email:z.email("Invalid email address"),
    password:z.string().min(8,"Password must be at least 8 characters")
})
export type SignUpInput = z.infer<typeof signUpSchema>
export type LogInInput = z.infer<typeof logInSchema>
