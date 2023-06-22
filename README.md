Reads binary data of **.wav**-file

### Usage via CLI
1) `npm install wavread`
2) `node wavread --source=C:/Users/Rita/Desktop/barebear.wav`
![](https://raw.githubusercontent.com/hypotenuse/githubimages/master/wavread/d1.PNG)

### As a Library
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
