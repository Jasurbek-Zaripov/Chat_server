import { writeFile } from 'fs/promises'
import { join } from 'path'

/**
 *
 * @param {{mimeType:"image" | "video"| "audio", name:"filename", buffer}} param0
 * @returns undefined | Error
 */
async function writeFileFun({ mimeType, name, buffer }) {
  try {
    let path = join(process.cwd(), 'res', mimeType.split('/')[0], name)
    await writeFile(path, buffer)
  } catch (xato) {
    return xato
  }
}
export { writeFileFun }
