const jwt = require('jsonwebtoken')
const fs = require('fs')
const secretKey = 'minMagicCube202303211547pl'
// (过期)id=2;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZXhwaXJlVGltZSI6IjIwMjIgMSAxIiwidXNlck5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJ0eXBlIjoi5byA5Y-R6ICFIiwic291cmNlIjoi5pegIiwiaWF0IjoxNjc5NDQ5NDA3fQ.eemOSszRU0sgfFyt-SEibDkFi51JcxD03_YKYRRQKdo
// (永久)id=1;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwaXJlVGltZSI6MCwidXNlck5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJ0eXBlIjoi5byA5Y-R6ICFIiwic291cmNlIjoi5pegIiwiaWF0IjoxNjc5NDQ5NDM2fQ.hqkJRANBa5-FKgRQSJONpmcF8_AdRVqPkpu89inK14I
// (2023 6 1 1)id=3;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZXhwaXJlVGltZSI6IjIwMjMgNiAxIDEiLCJ1c2VyTmFtZSI6Iui2hee6p-euoeeQhuWRmCIsInR5cGUiOiLlvIDlj5HogIUiLCJzb3VyY2UiOiLml6AiLCJpYXQiOjE2Nzk0NDk1NjV9.R1BfP0IcrQ92pIb8KDx8OdgWDIbgFNj79mPLEvXoUbU
// 创建JWT令牌
function jwtCreat(payload) {
  if (Object.prototype.toString.call(payload) !== '[object Object]') {
    throw 'not object'
  }
  payload = {
    id: 3,
    expireTime: '2023 6 1 1', // 过期时间0，为永久
    userName: '超级管理员',
    type: '开发者', // 会员or普通用户
    source: '无' // 用户来源qq..
  }
  const token = jwt.sign(payload, secretKey, )
  return token
}


// 验证JWT令牌
function jwtVerify(token) {
  try {
    if (!token) {
      throw 'token not empty'
    }
    const decoded = jwt.verify(token, secretKey)
    if (decoded.id) {
      // 把token存放到本地
      fs.writeFileSync('token.txt', token)
      return decoded
    } else {
      throw 'token解析没有数据'
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log('Token has expired')
      throw 'Token has expired'
    } else {
      throw 'Token is not valid'
    }
  }
}

function jwtGetToken() {
  const path = './token.txt'
  try {
    if (fs.existsSync(path)) {
      return fs.readFileSync('./token.txt').toString()
    } else {
      return ''
    }
  } catch (error) {
    console.log(error)
    return ''
  }

}

// try {
//   console.log(jwtCreat({}))
//   console.log(jwtGetToken())

// } catch (error) {
//   console.log(error)
// }
export default { jwtVerify, jwtCreat, jwtGetToken }

