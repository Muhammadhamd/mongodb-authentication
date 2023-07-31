import express from "express"
const router = express.Router()
import path from "path"
const __dirname = path.resolve()
import authRouter from './routes/auth.mjs'

router.use(authRouter)


export default router