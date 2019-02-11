### wavread lib
**wavread** is a tiny-lib for Node.js that reads binary data of **Waveform Audio File Format (WAVE) (.wav extension)** file and **gives base information** of it. **Note: Lib won't retrieve all information stored in wav**

### Usage via CLI
1) `npm install wavread`
2) `node wavread --source=C:/Users/Rita/Desktop/barebear.wav`
![](https://raw.githubusercontent.com/hypotenuse/githubimages/master/wavread/d1.PNG)

### Usage as a Library
1) `npm install wavread`
```js
  const wavread = require('wavread')
  wavread('C:/Users/Rita/Desktop/barebear.wav', info => {
    info.specification // 'RIFF'
    info.byteRate // [176.4, 'Kbit/s']
    info.bitsPerSample // [16, 'bits']
    info.duration // [27768.3, 'ms']
    // etc..
  })
```
