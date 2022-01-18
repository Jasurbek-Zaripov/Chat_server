import { Router } from 'express'
import { dbModule } from '../modules/db.module.js'
import multer from 'multer'
import { writeFileFun } from '../modules/files.module.js'

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    let ex = file?.mimetype?.split('/')[0]
    if (ex && ex != 'image' && ex != 'video' && ex != 'audio') {
      return cb(new Error('file rasm video yoki audio bulishi kerak!'))
    }
    req.ex = ex
    return cb(null, true)
  },
}).single('any')

const rout = Router()

//new message!
rout.put('/msg', async (req, res, next) => {
  try {
    upload(req, res, async e => {
      try {
        if (e) throw new Error(e.message)
        let { toUserid, msg } = req.body

        if (!toUserid || !msg) throw new Error('malumot yuq!')
        if (msg.length > 30) throw new Error('xabar juda uzun!')

        let db = await dbModule.readDb()
        let newMsg
        let newMsgYou
        let superId = '' + Date.now()
        let superDate = new Date().toLocaleTimeString()

        if (req?.file?.originalname) {
          let Filename =
            superId +
            req.file.originalname.replace(/\s|[^a-z0-9]/gi, '_') +
            '.' +
            req.file.mimetype.split('/')[1]
          newMsg = {
            id: superId,
            toUserid,
            msg,
            pathFile: '/' + req.ex + '/' + Filename,
            type: req.file.mimetype,
            size: (req.file.size / 1024 / 1024).toFixed(2),
            originalname: req.file.originalname,
            time: superDate,
          }
          newMsgYou = {
            id: superId,
            toMe: req.userId,
            msg,
            pathFile: '/' + req.ex + '/' + Filename,
            type: req.file.mimetype,
            size: (req.file.size / 1024 / 1024).toFixed(2),
            originalname: req.file.originalname,
            time: superDate,
          }
          let ErRor = await writeFileFun({
            mimeType: req.file.mimetype,
            name: Filename,
            buffer: req.file.buffer,
          })
          if (ErRor) throw new Error(ErRor.message)
        } else {
          newMsg = {
            id: superId,
            toUserid,
            msg,
            time: superDate,
          }
          newMsgYou = {
            id: superId,
            toMe: req.userId,
            msg,
            time: superDate,
          }
        }

        if (newMsg) {
          db[req.userId]['messages'].push(newMsg)
          db[toUserid]['messages'].push(newMsgYou)

          db[req.userId]['change'] = true
          db[toUserid]['change'] = true

          let EroRr = await dbModule.writeDb(db)
          if (EroRr) throw new Error(EroRr.message)
          return res.json(newMsg)
        }
        throw new Error('kutilmagan Xato!')
      } catch (er) {
        return next(er)
      }
    })
  } catch (xato) {
    next(xato)
  }
})

rout.get('/users', async (req, res, next) => {
  try {
    let db = await dbModule.readDb()

    for (const id in db) {
      if (Object.hasOwnProperty.call(db, id)) {
        const obj = db[id]
        delete obj['password']
        delete obj['refresh_token']
      }
    }

    return res.json(db)
  } catch (xato) {
    next(xato)
  }
})
rout.get('/change', async (req, res, next) => {
  try {
    let db = await dbModule.readDb()

    if (!db[req.userId]) throw new Error('user topilmadi!')
    if (db[req.userId]['change']) {
      db[req.userId]['change'] = false
      let ErRor = await dbModule.writeDb(db)
      if (ErRor) throw new Error(ErRor.message)
      return res.json({ yes: 'ok!' })
    }
    return res.json({ no: 'ok!' })
  } catch (xato) {
    next(xato)
  }
})
export default rout
