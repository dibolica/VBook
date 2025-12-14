import crypto from 'crypto'
export default function sha1(s) {
  return crypto.createHash('sha1').update(s || '').digest('hex')
}
