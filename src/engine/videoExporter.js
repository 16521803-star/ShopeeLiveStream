// MediaRecorder Video Exporter Module for Shopee Live 9:16 Canvas with Audio Stream Mixing & Duration Header Repair
import fixWebmDuration from 'fix-webm-duration';

export class VideoExporter {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.audioContext = null;
    this.audioDestination = null;
    this.masterMixGain = null;
    this.audioAnalyser = null;
    this.analyserBuffer = null;
    this.silentOscillator = null;
    this.silentGain = null;
    this.micStream = null;
    this.micSourceNode = null;
    this.systemAudioStream = null;
    this.systemAudioSourceNode = null;
    this.systemAudioElement = null;
    this.recordMimeType = 'video/webm';
    this.recordingStartTime = 0;
    this.hasActiveAudio = false;
  }

  /**
   * Initializes Web Audio API AudioContext and MediaStreamDestination singleton
   * Includes continuous silent oscillator to keep Chromium audio pipeline alive and prevent frame drops/stalling
   */
  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.audioDestination = this.audioContext.createMediaStreamDestination();

        // Master mixer gain node & real-time audio level analyser
        this.masterMixGain = this.audioContext.createGain();
        this.masterMixGain.gain.value = 1.0;
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 256;

        this.masterMixGain.connect(this.audioDestination);
        this.masterMixGain.connect(this.audioAnalyser);

        // Continuous Silent Audio Keeper:
        // Feeding a gain=0 oscillator ensures audioDestination continuously outputs active PCM samples (zeros).
        // This prevents Chromium's MediaRecorder from pausing, starving, or dropping video frames during silences,
        // pauses between speech stages, or when waiting for speech to begin.
        try {
          this.silentOscillator = this.audioContext.createOscillator();
          this.silentGain = this.audioContext.createGain();
          this.silentGain.gain.value = 0; // Absolute silence (gain = 0)
          this.silentOscillator.connect(this.silentGain);
          this.silentGain.connect(this.audioDestination);
          // Also connect to audioContext.destination (speakers) at 0-gain so the browser flags this tab as
          // actively playing audio, exempting it from background tab suspension / aggressive CPU throttling
          this.silentGain.connect(this.audioContext.destination);
          this.silentOscillator.start(0);
        } catch (e) {
          console.warn("[VideoExporter] Could not initialize silent audio keeper:", e);
        }
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioDestination;
  }

  /**
   * Returns current real-time audio level (0 to 100) from the recording mixer
   */
  getAudioLevel() {
    if (!this.audioAnalyser || !this.isRecording) return 0;
    if (!this.analyserBuffer) {
      this.analyserBuffer = new Uint8Array(this.audioAnalyser.fftSize);
    }
    this.audioAnalyser.getByteTimeDomainData(this.analyserBuffer);
    let maxDeviation = 0;
    for (let i = 0; i < this.analyserBuffer.length; i++) {
      const dev = Math.abs(this.analyserBuffer[i] - 128);
      if (dev > maxDeviation) maxDeviation = dev;
    }
    return Math.min(100, Math.round((maxDeviation / 55) * 100));
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
      // Route to MediaRecorder audio track + analyser via masterMixGain
      source.connect(this.masterMixGain || this.audioDestination);
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
        this.micSourceNode.connect(this.masterMixGain || this.audioDestination);
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
   * Capture pure Desktop/System audio digitally without microphone noise.
   * IMPORTANT FOR WEBSPEECH (Hoài My / Nam Minh):
   *1. window.speechSynthesis outputs via Windows System Audio (OS mixer), NOT inside the Browser Tab's WebAudio pipeline.
   *   Therefore we MUST request `displaySurface: 'monitor'` (Entire Screen) + `systemAudio: 'include'` and NOT `preferCurrentTab: true`.
   *2. We MUST NOT call `videoTrack.stop()` while recording, because stopping the video track of a getDisplayMedia stream
   *   in Chrome/Edge immediately terminates the entire capture session and kills the audio track!
   *3. We MUST attach the audio stream to a muted HTML5 <audio> element so Chromium actively pulls PCM packets into WebAudio.
   */
  async attachSystemAudioStream(options = {}) {
    const { requireSystemAudio = false } = options;
    try {
      this.initAudioContext();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        return { ok: false, reason: 'UNSUPPORTED' };
      }

      // Prompt user to share Entire Screen + System Audio (or Tab if using in-tab audio)
      this.systemAudioStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 5, max: 15 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false
        },
        systemAudio: 'include'
      });

      const audioTracks = this.systemAudioStream.getAudioTracks();
      if (audioTracks.length === 0) {
        // User forgot to toggle "Share system audio / Chia sẻ âm thanh hệ thống"
        this.systemAudioStream.getTracks().forEach(t => t.stop());
        this.systemAudioStream = null;
        return { ok: false, reason: 'NO_AUDIO_TRACK' };
      }

      const videoTracks = this.systemAudioStream.getVideoTracks();
      const videoTrack = videoTracks[0];
      const settings = (videoTrack && typeof videoTrack.getSettings === 'function') ? videoTrack.getSettings() : {};
      const displaySurface = settings.displaySurface || '';

      // If using WebSpeech (Hoài My / Nam Minh), sharing a single Browser Tab ('browser') will NOT capture OS TTS!
      if (requireSystemAudio && displaySurface === 'browser') {
        this.systemAudioStream.getTracks().forEach(t => t.stop());
        this.systemAudioStream = null;
        return { ok: false, reason: 'TAB_SELECTED_FOR_WEBSPEECH' };
      }

      // NOTE: Do NOT call videoTrack.stop() here! Stopping the video track of getDisplayMedia
      // immediately kills the entire sharing session and stops the audio track in Chrome/Edge.

      if (this.audioContext && this.audioDestination) {
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume().catch(() => {});
        }

        const audioOnlyStream = new MediaStream([audioTracks[0]]);

        // Chromium Bug Workaround: Attach getDisplayMedia audio stream to a muted <audio> element
        // so Chrome's media pipeline actively decodes and pumps PCM buffers into AudioContext.
        if (this.systemAudioElement) {
          try {
            this.systemAudioElement.pause();
            this.systemAudioElement.srcObject = null;
            this.systemAudioElement.remove();
          } catch (e) {}
        }
        this.systemAudioElement = document.createElement('audio');
        this.systemAudioElement.srcObject = audioOnlyStream;
        this.systemAudioElement.muted = true;
        this.systemAudioElement.volume = 0;
        this.systemAudioElement.style.display = 'none';
        document.body.appendChild(this.systemAudioElement);
        await this.systemAudioElement.play().catch(() => {});

        this.systemAudioSourceNode = this.audioContext.createMediaStreamSource(audioOnlyStream);
        this.systemAudioSourceNode.connect(this.masterMixGain || this.audioDestination);

        console.log(`[VideoExporter] System audio stream attached successfully (surface: ${displaySurface || 'screen'}, track: ${audioTracks[0].label})`);
        return { ok: true, surface: displaySurface };
      }
    } catch (err) {
      console.warn("[VideoExporter] Desktop/System audio capture cancelled or unavailable:", err);
      return { ok: false, reason: 'CANCELLED', error: err };
    }
    return { ok: false, reason: 'UNKNOWN' };
  }

  detachSystemAudioStream() {
    if (this.systemAudioElement) {
      try {
        this.systemAudioElement.pause();
        this.systemAudioElement.srcObject = null;
        this.systemAudioElement.remove();
      } catch (e) {}
      this.systemAudioElement = null;
    }
    if (this.systemAudioSourceNode) {
      try { this.systemAudioSourceNode.disconnect(); } catch (e) {}
      this.systemAudioSourceNode = null;
    }
    if (this.systemAudioStream) {
      try {
        this.systemAudioStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.systemAudioStream = null;
    }
  }

  /**
   * Determine best supported MIME type:
   * - If includeAudio is true: prioritize MP4 with AAC, fallback to WebM with Opus
   * - If includeAudio is false: use pure video MIME types WITHOUT audio codecs to avoid MediaRecorder muxer stalls
   */
  getOptimalMimeType(includeAudio = true) {
    const candidates = includeAudio ? [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ] : [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  }

  /**
   * Starts video recording.
   * @param {Object} options
   * @param {boolean} options.includeAudio - Whether to record audio track alongside video
   */
  startRecording(options = {}) {
    const { includeAudio = false } = options;
    this.recordedChunks = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.hasActiveAudio = includeAudio;

    // 1. Capture 30 FPS video stream from Canvas (matches standard 30fps live broadcast)
    const canvasStream = this.canvas.captureStream(30);
    const tracks = [...canvasStream.getVideoTracks()];

    // 2. Mix Video & Audio Tracks ONLY if includeAudio is requested
    if (includeAudio) {
      this.initAudioContext();
      if (this.audioDestination && this.audioDestination.stream) {
        const audioTracks = this.audioDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          tracks.push(audioTracks[0]);
        }
      }
    }

    const combinedStream = new MediaStream(tracks);
    this.recordMimeType = this.getOptimalMimeType(includeAudio);

    const recorderOptions = {
      mimeType: this.recordMimeType,
      videoBitsPerSecond: 5000000 // 5 Mbps 9:16 HD
    };
    if (includeAudio) {
      recorderOptions.audioBitsPerSecond = 128000; // 128 kbps stereo audio
    }

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, recorderOptions);
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

    // Use 1000ms timeslice to bundle chunks every second reliably
    this.mediaRecorder.start(1000);
    console.log(`[VideoExporter] Recording started (${includeAudio ? 'Video + Audio' : 'Pure Video (No Audio)'}), MIME: ${this.recordMimeType}`);
  }

  /**
   * Stops recording and returns the finished Blob.
   * If recorded in WebM, automatically fixes missing duration metadata header.
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        this.isRecording = false;
        this.detachMicrophoneStream();
        this.detachSystemAudioStream();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        this.detachMicrophoneStream();
        this.detachSystemAudioStream();

        const duration = Date.now() - this.recordingStartTime;
        const finalType = this.recordMimeType || 'video/mp4';
        const rawBlob = new Blob(this.recordedChunks, { type: finalType });

        console.log(`[VideoExporter] Recording finished. Duration: ${(duration / 1000).toFixed(1)}s, Chunks: ${this.recordedChunks.length}, Size: ${(rawBlob.size / 1024 / 1024).toFixed(2)} MB`);

        // If WebM format, patch missing duration metadata header so media players display full duration
        if (finalType.includes('webm') && duration > 0 && typeof fixWebmDuration === 'function') {
          try {
            const fixedBlob = await fixWebmDuration(rawBlob, duration, { logger: false });
            console.log(`[VideoExporter] WebM duration successfully patched to ${(duration / 1000).toFixed(1)}s`);
            resolve(fixedBlob);
            return;
          } catch (err) {
            console.warn("[VideoExporter] Could not patch WebM duration header, returning raw blob:", err);
          }
        }

        resolve(rawBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.error("[VideoExporter] Error stopping MediaRecorder:", err);
        this.isRecording = false;
        this.detachMicrophoneStream();
        this.detachSystemAudioStream();
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
    }, 1000);
  }
}
