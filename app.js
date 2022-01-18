import express from 'express'
import { _ } from './modules/app.module.js'
import rout from './controllers/auth.controller.js'
import users from './controllers/app.controller.js'
import cors from 'cors'
import dotenv from 'dotenv'
import { ValidateToken } from './middleware/token.middleware.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// public files
app.get(/\/(image)?(video)?(audio)?\/.*/, _.readStream)

app.use('/auth', rout)
app.use('/private', ValidateToken, users)

//error handler
app.use((err, req, res, next) => {
  try {
    if (err) {
      return res.json({ ERROR: err.message })
    }
  } catch (xato) {
    console['log'](xato)
  }
})
app.listen(PORT, () => console['log'](`running http://localhost:${PORT}`))
