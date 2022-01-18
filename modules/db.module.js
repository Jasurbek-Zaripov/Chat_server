import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

class DbModule {
  constructor() {
    this.pathDb = join(process.cwd(), 'Database', 'Data.json')
  }

  /**
   *
   * @returns "Databse"
   */
  async readDb() {
    try {
      let db = await readFile(this.pathDb, 'utf-8')
      db = JSON.parse(db || '{}')
      return db
    } catch (xato) {
      return xato
    }
  }

  /**
   *
   * @param {"DB"} data
   * @returns undefined | Error
   */
  async writeDb(data) {
    try {
      await writeFile(this.pathDb, JSON.stringify(data, null, 2))
    } catch (xato) {
      return xato
    }
  }
}

let dbModule = new DbModule()
export { dbModule }
