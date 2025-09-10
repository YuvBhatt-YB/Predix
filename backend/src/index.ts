
import express, { Request,Response } from "express"
import "./passport/passportConfig"
import authRoute from "./routes/auth"
import marketsRoute from "./routes/markets"
import fundsRoute from "./routes/funds"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import dotenv from "dotenv"

dotenv.config()
const app = express()

const PORT = 8000

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(express.json())
app.use(session({
    secret:"hello-world",
    rolling:true,
    resave:false,
    saveUninitialized: false,
    cookie:{maxAge:60*60*1000,httpOnly:true,secure:false,sameSite:"lax"}
}))
app.use(passport.initialize())
app.use(passport.session())
app.get("/",(request: Request,response: Response)=>{
    return response.json({message:"Hello world"})
})

app.use("/auth",authRoute)
app.use("/markets",marketsRoute)
app.use("/funds",fundsRoute)

app.listen(PORT,(): void=>{console.log(`Server is Running at PORT ${PORT}`)})