// MediaRecorder Video Exporter Module for Shopee Live 9:16 Canvas with Audio Stream Mixing

export class VideoExporter {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.audioContext = null;
    this.audioDestination = null;
    this.micStream = null;
    this.micSourceNode = null;
    this.recordMimeType = 'video/webm';
  }

  /**
   * Initializes Web Audio API AudioContext and MediaStreamDestination singleton
   */
  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.audioDestination = this.audioContext.createMediaStreamDestination();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioDestination;
  }

  /**
   * Connect an HTML5 <audio> or <video> element to the recording audio mixer
   * Routes sound simultaneously to speakers (destination) and recorder (audioDestination)
   */
  attachMediaAudio(mediaElement) {
    if (!mediaElement) return;
    try {
      this.initAudioContext();
      if (!this.audioContext || !this.audioDestination) return;

      if (mediaElement._connectedToExporter) return;
      mediaElement._connectedToExporter = true;

      const source = this.audioContext.createMediaElementSource(mediaElement);
      // Route to MediaRecorder audio track
      source.connect(this.audioDestination);
      // Route to user's speakers/headphones
      source.connect(this.audioContext.destination);
    } catch (err) {
      console.warn("[VideoExporter] Could not attach media audio:", err);
    }
  }

  /**
   * Optional: Capture microphone or Stereo Mix loopback (useful when using WebSpeech voices)
   */
  async attachMicrophoneStream() {
    try {
      this.initAudioContext();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      if (this.micStream && this.audioContext && this.audioDestination) {
        this.micSourceNode = this.audioContext.createMediaStreamSource(this.micStream);
        this.micSourceNode.connect(this.audioDestination);
        return true;
      }
    } catch (err) {
      console.warn("[VideoExporter] Microphone access not granted or unavailable:", err);
      return false;
    }
    return false;
  }

  detachMicrophoneStream() {
    if (this.micSourceNode) {
      try { this.micSourceNode.disconnect(); } catch (e) {}
      this.micSourceNode = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.micStream = null;
    }
  }

  /**
   * Determine best supported MIME type (prefer MP4/H.264+AAC for Shopee compatibility, fallback to WebM/Opus)
   */
  getOptimalMimeType() {
    const candidates = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];

    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  }

  startRecording() {
    this.recordedChunks = [];
    this.initAudioContext();

    // 1. Capture 30 FPS video stream from Canvas (matches standard 30fps live broadcast)
    const canvasStream = this.canvas.captureStream(30);

    // 2. Mix Video & Audio Tracks
    const tracks = [...canvasStream.getVideoTracks()];
    if (this.audioDestination && this.audioDestination.stream) {
      const audioTracks = this.audioDestination.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        tracks.push(audioTracks[0]);
      }
    }

    const combinedStream = new MediaStream(tracks);
    this.recordMimeType = this.getOptimalMimeType();

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: this.recordMimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps 9:16 HD
        audioBitsPerSecond: 128000   // 128 kbps stereo audio
      });
    } catch (e) {
      console.warn("[VideoExporter] MediaRecorder fallback without bitsPerSecond options:", e);
      try {
        this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType: this.recordMimeType });
      } catch (e2) {
        this.mediaRecorder = new MediaRecorder(combinedStream);
      }
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data chunks every 100ms
    this.isRecording = true;
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        this.detachMicrophoneStream();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.detachMicrophoneStream();
        const finalType = this.recordMimeType || 'video/mp4';
        const blob = new Blob(this.recordedChunks, { type: finalType });
        resolve(blob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.isRecording = false;
        this.detachMicrophoneStream();
        resolve(null);
      }
    });
  }

  downloadVideo(blob, baseFilename = 'DinCox_ShopeeLive_Video') {
    if (!blob) return;
    const isMp4 = (blob.type || this.recordMimeType || '').includes('mp4');
    const ext = isMp4 ? '.mp4' : '.webm';
    const cleanName = baseFilename.replace(/\.(webm|mp4)$/i, '');
    const finalFilename = `${cleanName}${ext}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }
}
