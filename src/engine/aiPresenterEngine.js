// AI MC Presenter & Real Video Controller Engine

// Polyfill Canvas roundRect for browsers without native support
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  if (CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
      if (typeof radii === 'number') {
        radii = [radii, radii, radii, radii];
      } else if (!radii) {
        radii = [0, 0, 0, 0];
      } else if (!Array.isArray(radii)) {
        radii = [radii, radii, radii, radii];
      }
      const r0 = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, radii[0] || 0);
      const r1 = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, radii[1] || r0);
      const r2 = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, radii[2] || r0);
      const r3 = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, radii[3] || r1);

      this.moveTo(x + r0, y);
      this.lineTo(x + w - r1, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r1);
      this.lineTo(x + w, y + h - r2);
      this.quadraticCurveTo(x + w, y + h, x + w - r2, y + h);
      this.lineTo(x + r3, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r3);
      this.lineTo(x, y + r0);
      this.quadraticCurveTo(x, y, x + r0, y);
      this.closePath();
      return this;
    };
  }
}

export class AIPresenterEngine {
  constructor(presenterData) {
    this.presenter = presenterData;
    this.img = new Image();
    this.isLoaded = false;
    this.lipVolume = 0;
    this.gesturePhase = 0;
    this.headAngle = 0;
    this.breathPhase = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;

    // Real MC Video Stream Support
    this.videoEl = null;
    this.isVideoLoaded = false;
    this.useRealVideo = false;

    this.loadAvatar(presenterData.avatar);
  }

  loadAvatar(url) {
    this.isLoaded = false;
    const cleanUrl = (typeof url === 'string' && url.startsWith('/assets/')) ? '.' + url : url;
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = cleanUrl;
    this.img.onload = () => {
      this.isLoaded = true;
    };
    this.img.onerror = () => {
      // Fallback without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.src = cleanUrl;
      fallbackImg.onload = () => {
        this.img = fallbackImg;
        this.isLoaded = true;
      };
      fallbackImg.onerror = () => {
        this.isLoaded = false;
      };
    };
  }

  setPresenter(presenterData) {
    this.presenter = presenterData;
    if (presenterData.videoUrl) {
      this.loadVideoSource(presenterData.videoUrl);
    } else {
      this.useRealVideo = false;
      this.loadAvatar(presenterData.avatar);
    }
  }

  loadVideoSource(urlOrBlob) {
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.remove();
    }

    const video = document.createElement('video');
    // Only set crossOrigin for remote http/https URLs (NOT for local blob: or data: URIs!)
    if (typeof urlOrBlob === 'string' && (urlOrBlob.startsWith('http://') || urlOrBlob.startsWith('https://'))) {
      video.crossOrigin = 'anonymous';
    }

    video.src = urlOrBlob;
    video.loop = true;
    video.muted = true; // Muted for canvas capture safe autoplay
    video.playsInline = true;
    video.autoplay = true;

    this.isVideoLoaded = false;
    this.useRealVideo = true;

    const onReady = () => {
      this.isVideoLoaded = true;
      video.play().catch(err => console.warn("Video play error:", err));
    };

    video.onloadeddata = onReady;
    video.oncanplay = onReady;
    video.onloadedmetadata = onReady;

    video.load();

    this.videoEl = video;
  }

  update(lipVolume = 0) {
    this.lipVolume = lipVolume;
    this.breathPhase += 0.04;

    // Eye blinking timer for 2D avatar mode
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    if (lipVolume > 0.1) {
      this.gesturePhase += 0.12;
      this.headAngle = Math.sin(this.gesturePhase) * 0.06;
    } else {
      this.headAngle = Math.sin(this.breathPhase * 0.6) * 0.02;
    }
  }

  render(ctx, x, y, width, height) {
    // MODE B: Real MC MP4 Video Stream
    if (this.useRealVideo && this.videoEl && (this.isVideoLoaded || this.videoEl.readyState >= 2)) {
      ctx.save();
      try {
        if (this.videoEl.paused) {
          this.videoEl.play().catch(() => {});
        }
        ctx.drawImage(this.videoEl, x, y, width, height);
      } catch (err) {
        console.warn("Could not draw video frame:", err);
      }

      // Real MC Video Active Badge
      ctx.fillStyle = 'rgba(0, 230, 118, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x + 20, y + 20, 240, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🎥 VIDEO MC NGƯỜI THẬT', x + 35, y + 44);

      ctx.restore();
      return;
    }

    // MODE A: 2D Animated AI Avatar
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // Expressive breathing, swaying & head nodding
    const swayX = Math.sin(this.breathPhase * 0.7) * 14;
    const breathY = Math.cos(this.breathPhase * 1.4) * 16;
    const talkBounce = this.lipVolume * 12;

    ctx.translate(swayX, breathY - talkBounce);
    ctx.rotate(this.headAngle);

    if (this.isLoaded) {
      ctx.drawImage(this.img, -width / 2, -height / 2, width, height);

      if (this.isBlinking) {
        ctx.save();
        ctx.fillStyle = '#1c2838';
        ctx.beginPath();
        ctx.ellipse(-45, -height * 0.2, 18, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(45, -height * 0.2, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dynamic Animated Lip Sync Mouth Overlay
      if (this.lipVolume > 0.1) {
        const mouthY = -height * 0.05;
        const mouthW = 28 + this.lipVolume * 36;
        const mouthH = 10 + this.lipVolume * 32;

        ctx.save();
        ctx.fillStyle = '#3a0007';
        ctx.beginPath();
        ctx.ellipse(0, mouthY, mouthW / 2, mouthH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-mouthW * 0.35, mouthY - mouthH * 0.35, mouthW * 0.7, mouthH * 0.3, 3);
        ctx.fill();

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + mouthH * 0.2, mouthW * 0.3, mouthH * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.fillStyle = '#0f2038';
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, 30);
      ctx.fill();

      ctx.fillStyle = '#e0a96d';
      ctx.beginPath();
      ctx.arc(0, -60, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E5A93C';
      ctx.beginPath();
      ctx.roundRect(-160, 60, 320, 240, 40);
      ctx.fill();
      ctx.restore();
    }

    if (this.lipVolume > 0.15) {
      ctx.save();
      const badgeY = height / 2 - 40;
      ctx.fillStyle = 'rgba(255, 42, 84, 0.95)';
      ctx.shadowColor = '#FF2A54';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-150, badgeY, 300, 44, 22);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎙️ MC AI ĐANG PHÁT BIỂU', 0, badgeY + 30);
      ctx.restore();
    }

    ctx.restore();
  }
}
