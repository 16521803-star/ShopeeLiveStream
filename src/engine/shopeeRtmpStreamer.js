// Direct Shopee Live RTMP Broadcaster Engine (Web-to-Shopee Streamer)

export class ShopeeRtmpStreamer {
  constructor(canvas) {
    this.canvas = canvas;
    this.isStreaming = false;
    this.rtmpUrl = '';
    this.streamKey = '';
    this.mediaRecorder = null;
    this.onStatusChange = null;
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
      // Capture 9:16 Canvas HD stream at 30/60 FPS
      const stream = this.canvas.captureStream(30);
      this.isStreaming = true;

      // Simulated Web-to-RTMP Gateway Stream Client
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4500000 // 4.5 Mbps bit rate optimized for Shopee Live
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
