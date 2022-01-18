import jwt from 'jsonwebtoken'
import { dbModule } from '../modules/db.module.js'

export async function ValidateToken(req, res, next) {
  try {
    let { access_token } = req.headers

    if (!access_token) throw new Error('user registratsiyadan utmagan!')

    let { id, agent } = jwt.verify(access_token, process.env.acc_token)

    let db = await dbModule.readDb()

    if (!db[id]) throw new Error('user topilmadi!')

    if (req.headers['user-agent'] != agent)
      throw new Error('Boshqa browserdan kiryapsiz!')

    req.userId = id

    return next()
  } catch (xato) {
    next(xato)
  }
}
