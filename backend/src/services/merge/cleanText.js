export function clean(s = '') {
  return s.replace(/\r\n/g, '\n').replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
}
export default clean
