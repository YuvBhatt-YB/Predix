
import express, { Request,Response } from "express"
import authRoute from "./routes/auth"
import cors from "cors"
const app = express()

const PORT = 8000

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(express.json())
app.get("/",(request: Request,response: Response)=>{
    return response.json({message:"Hello world"})
})

app.use("/auth",authRoute)

app.listen(PORT,(): void=>{console.log(`Server is Running at PORT ${PORT}`)})