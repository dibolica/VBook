import ffmpeg from 'fluent-ffmpeg'
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg'
ffmpeg.setFfmpegPath(FFMPEG_PATH)

export default {
  async stitchClips(clips = [], outPath = './out/final.mp4') {
    return new Promise((resolve, reject) => {
      if (!clips.length) return reject(new Error('no clips'))
      const command = ffmpeg()
      clips.forEach(c => command.input(c))
      command
        .on('error', (err) => reject(err))
        .on('end', () => resolve({ ok: true, path: outPath }))
        .mergeToFile(outPath, './tmp')
    })
  }
}
