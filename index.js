/*
Usage in CLI:
  node index.js --source=C:/Users/Rita/Desktop/barebear.wav

Usage as module:
  const wavread = require('wavread')
  wavread('C:/Users/Rita/Desktop/barebear.wav', info => { 
    console.log(info)
  })
*/
const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const fs = require('fs')
const util = require('util')
const {log, error} = console

const wavread = (inCLI, path, callback) => {
  
  const [UNIT0, UNIT1, UNIT2, UNIT3, UNIT4, EMTYSTRING, FORMATERROR, EMPTYWAV, RIFF, FORMAT, DATA] = ['Hz', 'Kbit/s', 'bytes', 'bits', 'ms', '', 'wav format required', 'empty wav', 'RIFF', 'fmt ', 'data'] 
  const notWAV = /\.wav$/i.test(path) == false
  if (notWAV) {
    if (inCLI) { return error(chalk.red(FORMATERROR)) }
    else { throw new TypeError(FORMATERROR) }
  }
  const sch = (buffer, offset, bytes) => buffer.slice(offset, offset + bytes)
  const findChunkOffset = (buffer, identifierBytes, chunkIdentifier) => {
    for (let i = 0; i <= buffer.byteLength - identifierBytes; ++i) {
      const subChunk = sch(buffer, i, identifierBytes)
      if (subChunk.asciiSlice() == chunkIdentifier) return i
    }
  }
  const audioFormatDescription = audioFormat => audioFormat == 1 ? 'PCM(Pulse-Code Modulation)' : EMTYSTRING
  // <Buffer 88 58 01 00> => <Buffer 00 01 58 88> => 00015888
  const convertBytesBuffer = (buffer, reverse) => {
    const hexPrefix = '\u0030\u0078'
    let stringifiedReversedBytes = undefined
    if (reverse) {
      stringifiedReversedBytes = new Buffer(buffer).reverse().hexSlice()
    }
    else stringifiedReversedBytes.hexSlice()
    return Number(`${hexPrefix}${stringifiedReversedBytes}`)
  }
  const channels = channels => {
    if (channels == 1) return 'Mono'
    else if (channels == 2) return 'Stereo'
    else return EMTYSTRING
  }
  const pnum = num => Math.round(num * 10) / 10
  const defineSize = bytes => {
    const [b, KB, MB, GB] = ['bytes', 'Kb', 'Mb', 'Gb']
    const unitSize = 1024
    const Kb = bytes / unitSize
    const Mb = Kb / unitSize
    const Gb = Mb / unitSize
    if (bytes < unitSize) return [bytes, b]
    if (Kb < unitSize) return [Kb, KB]
    if (Mb < unitSize) return [Mb, MB]
    if (Gb < unitSize) return [Gb, GB]
  }

  const rs = fs.createReadStream(path)

  rs.on('data', buffer => {
    rs.destroy()
    const isEMPTYWAV = buffer.byteLength < 44
    if (isEMPTYWAV) {
      if (inCLI) { return error(chalk.red(EMPTYWAV)) }
      else { throw new TypeError(EMPTYWAV) }
    }
    const identifierBytes = 4
    const RIFFChunkOffset = findChunkOffset(buffer, identifierBytes, RIFF)
    const chunkID = sch(buffer, RIFFChunkOffset, identifierBytes)
    const chunkSize = sch(buffer, RIFFChunkOffset + 4, identifierBytes)
    const format = sch(buffer, RIFFChunkOffset + 8, 4)

    const FORMATChunkOffset = findChunkOffset(buffer, identifierBytes, FORMAT)
    const subchunk1ID = sch(buffer, FORMATChunkOffset, 4)
    const subchunk1Size = sch(buffer, FORMATChunkOffset + 4, 4)
    const audioFormat = sch(buffer, FORMATChunkOffset + 8, 2)
    const numChannels = sch(buffer, FORMATChunkOffset + 10, 2)
    const sampleRate = sch(buffer, FORMATChunkOffset + 12, 4)
    const byteRate = sch(buffer, FORMATChunkOffset + 16, 4)
    const blockAlign = sch(buffer, FORMATChunkOffset + 20, 2)
    const bitsPerSample = sch(buffer, FORMATChunkOffset + 22, 2)

    const DATAChunkOffset = findChunkOffset(buffer, identifierBytes, DATA)
    const subchunk2ID = sch(buffer, DATAChunkOffset, 4)
    const subchunk2Size = sch(buffer, FORMATChunkOffset + 28, 4)

    const chunkIDPrepared = chunkID.asciiSlice()
    const isRIFF = chunkIDPrepared == RIFF
    const formatPrepared = format.asciiSlice()
    const audioFormatPrepared = convertBytesBuffer(audioFormat, isRIFF)
    const channelsPrepared = convertBytesBuffer(numChannels, isRIFF)
    const sampleRatePrepared = convertBytesBuffer(sampleRate, isRIFF)
    const byteRatePrepared = convertBytesBuffer(byteRate, isRIFF) / 1000 * 8
    const blockAlignPrepared = convertBytesBuffer(blockAlign, isRIFF)
    const bitsPerSamplePrepared = convertBytesBuffer(bitsPerSample, isRIFF)
    const durationPrepared = pnum(convertBytesBuffer(subchunk2Size, isRIFF) / convertBytesBuffer(byteRate, isRIFF) * 1000)
    const size = defineSize(convertBytesBuffer(subchunk2Size, isRIFF))

    if (inCLI) {
      log(`${chalk.grey('Specification:')} ${chalk.yellow(chunkIDPrepared)}`)
      log(`${chalk.grey('Format:')} ${chalk.yellow(formatPrepared)}`)
      log(`${chalk.grey('AudioFormat:')} ${chalk.yellow(audioFormatPrepared)} ${chalk.yellow(audioFormatDescription(audioFormatPrepared))}`)
      log(`${chalk.grey('Channels:')} ${chalk.yellow(channelsPrepared)} ${chalk.yellow(channels(channelsPrepared))}`)
      log(`${chalk.grey('SampleRate:')} ${chalk.yellow(sampleRatePrepared)}${chalk.yellow(UNIT0)}`)
      log(`${chalk.grey('ByteRate:')} ${chalk.yellow(byteRatePrepared)}${chalk.yellow(UNIT1)}`)
      log(`${chalk.grey('BlockAlign:')} ${chalk.yellow(blockAlignPrepared)}${chalk.yellow(UNIT2)}`)
      log(`${chalk.grey('BitsPerSample:')} ${chalk.yellow(bitsPerSamplePrepared)}${chalk.yellow(UNIT3)}`)
      log(`${chalk.grey('Duration:')} ${chalk.yellow(durationPrepared)}${chalk.yellow(UNIT4)}`)
      log(`${chalk.grey('Size:')} ${chalk.yellow(pnum(size[0]))}${chalk.yellow(size[1])}`)
    }
    else {
      const [specification, format, audioFormat, _channels, sampleRate, byteRate, blockAlign, bitsPerSample, duration, _size] = [
        chunkIDPrepared,
        formatPrepared,
        [audioFormatPrepared, audioFormatDescription(audioFormatPrepared)],
        [channelsPrepared, channels(channelsPrepared)],
        [sampleRatePrepared, UNIT0],
        [byteRatePrepared, UNIT1],
        [blockAlignPrepared, UNIT2],
        [bitsPerSamplePrepared, UNIT3],
        [durationPrepared, UNIT4],
        [pnum(size[0]), size[1]]
      ]
      callback({specification, format, audioFormat, sampleRate, byteRate, blockAlign, bitsPerSample, duration, channels: _channels, size: _size})
    }
  })
}

const inCLI = util.isString(argv.source)
if (inCLI) wavread(true, argv.source)

module.exports = (path, callback) => wavread(false, path, callback)