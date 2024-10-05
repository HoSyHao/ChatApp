import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from 'cors'
import cookieParser from "cookie-parser"
dotenv.config()
import { authRoutes } from "./routes/AuthRoutes.js"
import { contactsRoutes } from "./routes/ContactsRoutes.js"

const app = express()
app.use(express.json())
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))

app.use("/uploads/profiles", express.static("uploads/profiles"));   

app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactsRoutes)

mongoose
.connect(process.env.DATABASE_URL)
.then(() => console.log("DB Connect Succesfully"))
.catch(err =>console.log(err.message))

app.listen(process.env.PORT, () => {
    console.log("Server is Running")
})