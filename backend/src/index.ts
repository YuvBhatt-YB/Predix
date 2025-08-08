import express, { Request,Response } from "express"

const app = express()


const PORT = 8000

app.get("/",(request: Request,response: Response)=>{
    return response.json({message:"Hello world"})
})

app.listen(PORT,()=>{console.log(`Server is Running at PORT ${PORT}`)})