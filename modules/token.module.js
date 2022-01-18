import pkg from 'jsonwebtoken'
const { sign } = pkg

class TokenGen {
  genToken(payload) {
    let access_token = sign(payload, process.env.acc_token, {
      expiresIn: 5 * 60,
    })
    let refresh_token = sign(payload, process.env.ref_token, {
      expiresIn: '15d',
    })

    return {
      access_token,
      refresh_token,
    }
  }
}
let tkn = new TokenGen()
export { tkn }
