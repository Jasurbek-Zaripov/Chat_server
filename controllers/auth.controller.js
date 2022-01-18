import { Router } from 'express'
import multer from 'multer'
import { dbModule } from '../modules/db.module.js'
import { compare, genSalt, hash } from 'bcrypt'
import { tkn } from '../modules/token.module.js'
import { writeFileFun } from '../modules/files.module.js'
import jwt from 'jsonwebtoken'

async function BCR(password) {
  try {
    let salt = await genSalt(2)
    let hashPass = await hash(password, salt)
    return hashPass
  } catch (xato) {
    return xato
  }
}

const Rout = Router()

// multer config
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    let ex = file.mimetype.split('/')[1]
    if (ex != 'jpeg' && ex != 'jpg' && ex != 'png') {
      return cb(new Error('type only jpg jpeg png'))
    }
    cb(null, true)
  },
}).single('img')
// end multer

Rout.post('/register', async (req, res, next) => {
  try {
    upload(req, res, async er => {
      try {
        if (er) throw new Error(er.message)
        let { username, password } = req.body
        password += ''
        if (!username || !password) {
          throw new Error('malumot yuq!')
        }
        if (username.length > 50 || password.length > 12) {
          throw new Error('Juda uzun!')
        }
        if (password.length < 5) {
          throw new Error('Juda qisqa!')
        }
        let db = await dbModule.readDb()

        for (const key in db) {
          if (Object.hasOwnProperty.call(db, key)) {
            const element = db[key]
            if (element['username'] == username) {
              throw new Error("username oldin ro'yxatdan utgan!")
            }
          }
        }

        let id = await BCR(username)
        let HASHPASS = await BCR(password)
        let objToken = tkn.genToken({ id, agent: req.headers['user-agent'] })
        let FileName =
          Date.now() + req.file.originalname.replace(/\s|[^a-z0-9\.]/gi, '_')

        let SuperColor = `rgba(${parseInt(Math.random() * 256)}, ${parseInt(
          Math.random() * 256
        )},${parseInt(Math.random() * 256)},0.69)`

        db[id] = {
          username,
          photo: '/image/' + FileName,
          password: HASHPASS,
          isActive: true,
          change: false,
          myColor: SuperColor,
          refresh_token: objToken.refresh_token,
          messages: [],
          createTime: new Date().toLocaleTimeString(),
        }
        let ErRoR = await writeFileFun({
          mimeType: req.file.mimetype,
          name: FileName,
          buffer: req.file.buffer,
        })

        if (ErRoR) {
          throw new Error(ErRoR.message)
        }
        ErRoR = await dbModule.writeDb(db)
        if (ErRoR) {
          throw new Error(ErRoR.message)
        }
        return res.json({ objToken, id })
      } catch (_xato) {
        next(_xato)
      }
    })
  } catch (xato) {
    next(xato)
  }
})

Rout.post('/login', async (req, res, next) => {
  try {
    let { username, password } = req.body
    password += ''
    if (!username || !password) {
      throw new Error('malumot yuq!')
    }

    let db = await dbModule.readDb()

    for (const key in db) {
      if (Object.hasOwnProperty.call(db, key)) {
        const el = db[key]
        let bol = await compare(password, el['password'])
        if (el['username'] == username && bol) {
          let objToken = tkn.genToken({
            id: key,
            agent: req.headers['user-agent'],
          })
          el['refresh_token'] = objToken.refresh_token
          el['isActive'] = true
          await dbModule.writeDb(db)
          return res.json({ objToken, id: key })
        }
      }
    }

    throw new Error('password yoki username xato!')
  } catch (xato) {
    next(xato)
  }
})

Rout.get('/refresh', async (req, res, next) => {
  try {
    let { ref } = req.query
    if (!ref) throw new Error('token mavjud emas!')

    let db = await dbModule.readDb()
    let { id, agent } = jwt.verify(ref, process.env.ref_token)

    if (!db[id]) throw new Error('user topilmadi!')

    if (req.headers['user-agent'] != agent)
      throw new Error('boshqa browserdan kiryapsiz!')

    let objToken = tkn.genToken({ id, agent })

    db[id]['refresh_token'] = objToken.refresh_token
    let er = await dbModule.writeDb(db)

    if (er) throw new Error(er.message)
    return res.json({ objToken, id })
  } catch (xato) {
    next(xato)
  }
})
export default Rout
