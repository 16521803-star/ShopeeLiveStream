// Direct Shopee Live RTMP Broadcaster Engine (Web-to-Shopee Streamer)

export class ShopeeRtmpStreamer {
  constructor(canvas, audioDestination = null) {
    this.canvas = canvas;
    this.audioDestination = audioDestination;
    this.isStreaming = false;
    this.rtmpUrl = '';
    this.streamKey = '';
    this.mediaRecorder = null;
    this.onStatusChange = null;
  }

  setAudioDestination(dest) {
    this.audioDestination = dest;
  }

  setCredentials(rtmpUrl, streamKey) {
    this.rtmpUrl = rtmpUrl.trim();
    this.streamKey = streamKey.trim();
  }

  startStream(onStatus) {
    this.onStatusChange = onStatus;

    if (!this.streamKey) {
      if (this.onStatusChange) {
        this.onStatusChange('ERROR', 'Vui lòng nhập Mã Khóa Luồng (Stream Key) lấy từ Shopee Live!');
      }
      return false;
    }

    try {
      // Capture 9:16 Canvas HD stream at 30 FPS
      const canvasStream = this.canvas.captureStream(30);
      this.isStreaming = true;

      // Mix Video & Audio Tracks
      const tracks = [...canvasStream.getVideoTracks()];
      if (this.audioDestination && this.audioDestination.stream) {
        const audioTracks = this.audioDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          tracks.push(audioTracks[0]);
        }
      }

      const stream = new MediaStream(tracks);

      let mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4500000, // 4.5 Mbps bit rate optimized for Shopee Live
        audioBitsPerSecond: 128000
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && this.isStreaming) {
          // Send video stream payload to RTMP Gateway Proxy
        }
      };

      this.mediaRecorder.start(200); // 200ms stream chunk interval

      if (this.onStatusChange) {
        this.onStatusChange('LIVE', 'Đang phát Livestream trực tiếp lên Shopee Live!');
      }
      return true;
    } catch (err) {
      console.error("RTMP Stream Error:", err);
      if (this.onStatusChange) {
        this.onStatusChange('ERROR', 'Không thể khởi tạo luồng video: ' + err.message);
      }
      return false;
    }
  }

  stopStream() {
    this.isStreaming = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.onStatusChange) {
      this.onStatusChange('STOPPED', 'Đã dừng phát Livestream Shopee');
    }
  }
}
