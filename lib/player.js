const fs = require('fs'),
  { Decoder } = require('lame'),
  { EventEmitter } = require("events"),
  mm = require('musicmetadata'),
  Speaker = require("speaker"),
  pcmVolume = require("pcm-volume"),
  loudness = require("loudness");

class Player extends EventEmitter {
  static _defaults() { return {}; }
  constructor(options = {}){
    super();
    this._options = {...Player._defaults(), ...options};
  }

  play() {
    this.paused = false;
    let file = null, metadata = null, stream = fs.createReadStream(file);
    this.meta(stream, (err, data) => {
      if (!err)
        metadata = data
    });
    this.decoder = new Decoder();

    stream.pipe(this.decoder).once('format', (format) => this._playing(format)).once('finish', () => this.next());
  }

  _playing(format) {
    this._lameFormat = format;
    this._speaker = new Speaker(this._lameFormat);
    this._volume = {
      'readableStream': this,
      'Speaker': volume,
    };
    this.pipe(volume).once('close', () =>{});
  }

  pause() {
    if (this.paused) {
      this._volume.Speaker = new PcmVolume();
      this._volume.Speaker.pipe(new Speaker(this.lameFormat));
      this.decoder.pipe(this.volume.Speaker);
    } else {
      this.volume.Speaker.end()
    }
    this.paused = !this.paused;
  }

  stop() {
    if (this._volume) {
      this._volume.readableStream.unpipe();
      this._volume.Speaker.end();
    }
  }

  metadata(stream) {
    stream.on('error', err => this.emit('error', err));
    return new Promise(
      (resolve, reject)=>mm(stream, {duration:true}, (err, data)=> err && reject(err)|| resolve(data))
    );
  }
}