// AI MC Presenter Avatar Controller & Motion Engine

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

    this.loadAvatar(presenterData.avatar);
  }

  loadAvatar(url) {
    this.isLoaded = false;
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = url;
    this.img.onload = () => {
      this.isLoaded = true;
    };
  }

  setPresenter(presenterData) {
    this.presenter = presenterData;
    this.loadAvatar(presenterData.avatar);
  }

  update(lipVolume = 0) {
    this.lipVolume = lipVolume;
    this.breathPhase += 0.04;

    // Eye blinking timer
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
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // Expressive breathing, swaying & head nodding
    const swayX = Math.sin(this.breathPhase * 0.7) * 14;
    const breathY = Math.cos(this.breathPhase * 1.4) * 16;
    const talkBounce = this.lipVolume * 12;

    ctx.translate(swayX, breathY - talkBounce);
    ctx.rotate(this.headAngle);

    if (this.isLoaded) {
      // Draw main AI presenter portrait image
      ctx.drawImage(this.img, -width / 2, -height / 2, width, height);

      // Blinking Eyelids overlay
      if (this.isBlinking) {
        ctx.save();
        ctx.fillStyle = '#1c2838'; // Matches skin shadow tone
        // Eyelid left & right approximate locations
        ctx.beginPath();
        ctx.ellipse(-45, -height * 0.2, 18, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(45, -height * 0.2, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dynamic Animated Lip Sync Mouth Overlay when speaking
      if (this.lipVolume > 0.1) {
        const mouthY = -height * 0.05; // Approximate mouth level on portrait
        const mouthW = 28 + this.lipVolume * 36;
        const mouthH = 10 + this.lipVolume * 32;

        ctx.save();

        // Dark mouth cavity inside
        ctx.fillStyle = '#3a0007';
        ctx.beginPath();
        ctx.ellipse(0, mouthY, mouthW / 2, mouthH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper teeth line
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-mouthW * 0.35, mouthY - mouthH * 0.35, mouthW * 0.7, mouthH * 0.3, 3);
        ctx.fill();

        // Tongue highlight inside
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + mouthH * 0.2, mouthW * 0.3, mouthH * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lip outline
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }
    } else {
      // Stylized fallback 2D AI avatar graphics when image is loading
      ctx.save();
      ctx.fillStyle = '#0f2038';
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, 30);
      ctx.fill();

      // Avatar head
      ctx.fillStyle = '#e0a96d';
      ctx.beginPath();
      ctx.arc(0, -60, 110, 0, Math.PI * 2);
      ctx.fill();

      // Avatar body
      ctx.fillStyle = '#E5A93C';
      ctx.beginPath();
      ctx.roundRect(-160, 60, 320, 240, 40);
      ctx.fill();

      ctx.restore();
    }

    // Floating "🎙️ MC AI ĐANG PHÁT BIỂU" Live Badge
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
