import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join, parse } from 'path'

class Stream {
  async readStream(req, res, next) {
    try {
      let filePath = join(process.cwd(), 'res', req.url)
      let st = await stat(filePath)

      const mimeType = {
        '.mp4': 'video/mp4',
        '.json': 'application/json',
        '.css': 'text/css',
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.jpg': 'image/jpg',
        '.png': 'image/png',
        '.jpeg': 'image/jpeg',
        '.ogg': 'audio/ogg',
        '.mp3': 'audio/mpeg',
        '.mpeg': 'audio/mpeg',
      }

      res.writeHead(200, {
        'Content-Type': mimeType[parse(filePath).ext.toLowerCase()],
        'Content-Length': st.size,
      })

      let readStream = createReadStream(filePath)
      readStream.pipe(res)
    } catch (xato) {
      return next(xato)
    }
  }
}

//exports
let _ = new Stream()
export { _ }
