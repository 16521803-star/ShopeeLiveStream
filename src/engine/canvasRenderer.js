// Authentic Shopee Live 9:16 Vertical Video Renderer Engine

// Singleton formatter to prevent repeated garbage collection in 30/60fps render loop
const currencyFormatter = new Intl.NumberFormat('vi-VN');

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

export class ShopeeCanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 1080;
    this.height = 1920;

    // Set internal resolution to 9:16 high def (1080x1920)
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Performance & Resolution Scaling Engine (Standard: 1080p, Eco: 720p)
    this.performanceMode = 'standard';
    this.scaleFactor = 1.0;
    this.forceCanvasBlit = false;
    this._cachedSubtitleLines = [];

    this.currentProduct = null;
    this.presenterEngine = null;
    this.speechText = '';
    this.speechStage = '';
    this.likeCount = 14890;
    this.viewCount = 3420;

    this.hearts = [];
    this.productImg = new Image();
    this.isProductImgLoaded = false;

    // Flash sale banner toggle state (default: hidden for maximum video cleanliness & policy safety)
    this.showFlashSaleBanner = false;

    // Subtitle toggle state (default: true)
    this.showSubtitles = true;

    // Floating product card toggle state (default: true)
    this.showProductCard = true;

    this.branchName = 'DinCox';
    this.brandWatermark = '';
    // Shopee Live simulated chat feed
    this.chatFeed = [
      { user: 'ThuTrang_99', text: 'Mẫu sản phẩm này dùng thích lắm ạ!' },
      { user: 'MinhQuang_Sneaker', text: 'Shop cho xem cận cảnh chất liệu với ạ!' },
      { user: 'HoangLong_Shopee', text: 'Đã áp mã voucher 50K chốt đơn thành công!' },
      { user: 'YenNhi_02', text: 'Có được freeship hông shop?' },
      { user: 'DucAnh_39', text: 'Hàng chuẩn xịn chất lượng quá shop ơi ❤️' }
    ];

    this.initHearts();
  }

  setBranchName(name) {
    this.branchName = name || 'DinCox';
    if (this.branchName.toLowerCase() === 'dincox2') {
      this.brandWatermark = 'Live AI của Dincox';
    } else if (this.branchName.toLowerCase() === 'dincox') {
      this.brandWatermark = '';
    }
    if (this.chatFeed && this.chatFeed.length > 4) {
      this.chatFeed[4] = { user: 'DucAnh_39', text: `Hàng chuẩn xịn chất lượng quá ${this.branchName} ơi ❤️` };
    }
  }

  setBrandWatermark(text) {
    this.brandWatermark = text || '';
  }

  setShowFlashSaleBanner(show) {
    this.showFlashSaleBanner = !!show;
  }

  setFlashSaleTitle(title) {
    this.flashSaleTitle = title || '🔥 GIÁ LIVE ƯU ĐÃI';
  }

  setShowSubtitles(show) {
    this.showSubtitles = !!show;
  }

  setShowProductCard(show) {
    this.showProductCard = !!show;
  }

  setProduct(product) {
    this.currentProduct = product;
    this.isProductImgLoaded = false;
    this.productImg = new Image();
    if (product && product.image && typeof product.image === 'string' && product.image.trim().length > 0) {
      const cleanUrl = product.image.startsWith('/assets/') ? '.' + product.image : product.image;
      this.productImg.crossOrigin = 'anonymous';
      this.productImg.src = cleanUrl;
      this.productImg.onload = () => {
        this.isProductImgLoaded = true;
      };
      this.productImg.onerror = () => {
        // Fallback retry without crossOrigin
        const fallbackImg = new Image();
        fallbackImg.src = cleanUrl;
        fallbackImg.onload = () => {
          this.productImg = fallbackImg;
          this.isProductImgLoaded = true;
        };
        fallbackImg.onerror = () => {
          this.isProductImgLoaded = false;
        };
      };
    } else {
      this.isProductImgLoaded = false;
    }
  }

  setPresenterEngine(presenterEngine) {
    this.presenterEngine = presenterEngine;
  }

  setPerformanceMode(mode) {
    this.performanceMode = (mode === 'eco' || mode === 'audio_only') ? mode : 'standard';
    if (this.performanceMode === 'eco' || this.performanceMode === 'audio_only') {
      // 720p HD resolution: 921,600 pixels (reduces pixel workload by 56%!)
      this.canvas.width = 720;
      this.canvas.height = 1280;
      this.scaleFactor = 720 / 1080;
    } else {
      // 1080p Full HD resolution: 2,073,600 pixels
      this.canvas.width = 1080;
      this.canvas.height = 1920;
      this.scaleFactor = 1.0;
    }
    // Re-compute subtitle wrapping if needed
    if (this.speechText) {
      this._computeSubtitleLines();
    }
  }

  setSpeechState(text, stage) {
    this.speechText = text || '';
    this.speechStage = stage || '';
    this._computeSubtitleLines();
  }

  _computeSubtitleLines() {
    if (!this.speechText) {
      this._cachedSubtitleLines = [];
      return;
    }
    const bubW = this.width - 100;
    const fontSize = this.speechText.length > 100 ? 21 : 23;
    this.ctx.font = `bold ${fontSize}px sans-serif`;

    const words = this.speechText.split(' ');
    let line = '';
    let lines = [];
    const maxLines = 3;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > bubW - 44 && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
        if (lines.length === maxLines - 1) {
          let remaining = words.slice(i).join(' ');
          while (this.ctx.measureText(remaining + '...').width > bubW - 44 && remaining.length > 0) {
            const lastSpace = remaining.lastIndexOf(' ');
            if (lastSpace === -1) {
              remaining = remaining.substring(0, remaining.length - 1);
            } else {
              remaining = remaining.substring(0, lastSpace);
            }
          }
          lines.push(remaining ? (remaining + '...') : (words[i] + '...'));
          line = '';
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (line.trim() && lines.length < maxLines) {
      lines.push(line.trim());
    }
    this._cachedSubtitleLines = lines;
  }

  initHearts() {
    for (let i = 0; i < 18; i++) {
      this.hearts.push({
        x: this.width - 120 + (Math.random() * 60 - 30),
        y: this.height - 300 - Math.random() * 600,
        size: 26 + Math.random() * 26,
        speedY: 2.5 + Math.random() * 3.5,
        alpha: Math.random(),
        color: ['#ff4d4f', '#ff7a45', '#ffec3d', '#ff85c0'][Math.floor(Math.random() * 4)]
      });
    }
  }

  update(delta = 0.016) {
    // Update hearts
    this.hearts.forEach(h => {
      h.y -= h.speedY;
      h.x += Math.sin(h.y * 0.02) * 1.8;
      h.alpha -= 0.006;
      if (h.y < this.height * 0.35 || h.alpha <= 0) {
        h.y = this.height - 250;
        h.x = this.width - 120 + (Math.random() * 60 - 30);
        h.alpha = 1;
      }
    });

    // Increment simulated likes
    if (Math.random() < 0.35) {
      this.likeCount += Math.floor(Math.random() * 3 + 1);
    }
  }

  render(timestamp = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply scaling factor when in 720p Eco Mode (scale 1080x1920 layout down to 720x1280)
    if (this.scaleFactor !== 1.0) {
      ctx.scale(this.scaleFactor, this.scaleFactor);
    }

    // 1. FULL-SCREEN BACKGROUND STREAMER (MC AI or Real MP4 Video fills 100% canvas background!)
    const isAudioOnly = this.presenterEngine && this.presenterEngine.audioOnlyMode;
    if (this.presenterEngine && !isAudioOnly) {
      if (!this.presenterEngine.useRealVideo) {
        // Dark studio fallback gradient for 2D avatar mode
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#060d19');
        bgGradient.addColorStop(0.5, '#0b1b36');
        bgGradient.addColorStop(1, '#050912');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      this.presenterEngine.render(ctx, 0, 0, this.width, this.height, this.forceCanvasBlit);
    } else {
      // Dark studio fallback gradient (Audio-Only Mode or No Presenter)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGradient.addColorStop(0, '#060d19');
      bgGradient.addColorStop(0.5, '#0a192f');
      bgGradient.addColorStop(1, '#050912');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Render Shopee AI Disclosure Watermark (Top Left - Shopee Compliance)
    this.renderAiComplianceWatermark(ctx);

    // 2b. Render Brand Specific Live Watermark Badge (e.g. "Live AI của Dincox")
    if (this.brandWatermark) {
      this.renderBrandWatermarkBadge(ctx);
    }

    // 2c. Render Audio-Only Low-CPU Mode Badge
    if (isAudioOnly) {
      this.renderAudioOnlyBadge(ctx);
    }

    // 3. Render Floating Shoe Product Corner Badge Card (Upper Right)
    this.renderFloatingProductCorner(ctx, timestamp);

    // 4. Render Flash Sale & Voucher Banner (Lower Middle Overlay)
    this.renderFlashSaleBanner(ctx);

    // 5. Render Concise 1-2 Line Speech Subtitle Box (Above Shopee native chat area)
    if (this.speechText) {
      this.renderSpeechSubtitle(ctx);
    }

    ctx.restore();
  }

  // Official Shopee AI Livestream Compliance Watermark Badge
  renderAiComplianceWatermark(ctx) {
    ctx.save();
    const w = 445;
    const h = 50;
    const x = 40;
    const y = 135;

    // Translucent dark glass pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 25);
    ctx.fill();
    ctx.stroke();

    // Compliance green indicator dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 24, y + 25, 7, 0, Math.PI * 2);
    ctx.fill();

    // AI Disclosure text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('🤖 Trợ lý AI Streamer • Shopee Compliant', x + 42, y + 32);

    ctx.restore();
  }

  // Brand Specific Watermark Badge (e.g. "Live AI của Dincox" for Dincox2)
  renderBrandWatermarkBadge(ctx) {
    if (!this.brandWatermark) return;
    ctx.save();
    const text = this.brandWatermark;
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const w = textWidth + 56;
    const h = 48;
    const x = 40;
    const y = 196;

    // Translucent dark pill with DinCox brand gold border
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.90)');
    grad.addColorStop(1, 'rgba(229, 169, 60, 0.32)');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(229, 169, 60, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 24);
    ctx.fill();
    ctx.stroke();

    // DinCox glowing gold indicator dot
    ctx.fillStyle = '#E5A93C';
    ctx.beginPath();
    ctx.arc(x + 22, y + 24, 6, 0, Math.PI * 2);
    ctx.fill();

    // Text: "Live AI của Dincox"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x + 38, y + 31);

    ctx.restore();
  }

  // Audio-Only Low-CPU Mode Badge
  renderAudioOnlyBadge(ctx) {
    ctx.save();
    const w = 440;
    const h = 48;
    const x = 40;
    const y = this.brandWatermark ? 256 : 196;

    // Glowing cyan glass pill
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    grad.addColorStop(1, 'rgba(14, 165, 233, 0.35)');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 24);
    ctx.fill();
    ctx.stroke();

    // Cyan audio indicator dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + 22, y + 24, 6, 0, Math.PI * 2);
    ctx.fill();

    // Text: "🎧 Chế độ Âm thanh (Tắt video • CPU ~0%)"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('🎧 Chế độ Âm thanh (Tắt video • CPU ~0%)', x + 38, y + 31);

    ctx.restore();
  }

  // Authentic Shopee Floating Product Corner Card (Positioned directly above Flash Sale Banner)
  renderFloatingProductCorner(ctx, timestamp) {
    if (!this.showProductCard || !this.currentProduct) return;

    ctx.save();
    const hasImg = this.isProductImgLoaded && this.currentProduct.image && typeof this.currentProduct.image === 'string' && this.currentProduct.image.trim().length > 0;
    const hasSalePrice = typeof this.currentProduct.salePrice === 'number' && !isNaN(this.currentProduct.salePrice) && this.currentProduct.salePrice > 0;
    const floatY = Math.sin(timestamp * 0.003) * 6;
    const cardW = 320;
    const cardH = hasImg ? (hasSalePrice ? 395 : 355) : (hasSalePrice ? 95 : 55);
    const cardX = 50;
    const banY = this.height - 480;
    const cardY = banY - cardH - 20;

    // Glassmorphism card backdrop with thin transparent white border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY + floatY, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();

    // Product Title (Black font color, compact margin)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    const shortName = this.currentProduct.name.length > 24 
      ? this.currentProduct.name.substring(0, 22) + '...' 
      : this.currentProduct.name;
    ctx.fillText(shortName, cardX + 10, cardY + floatY + 32);

    // Shoe Product Thumbnail Box (ONLY if image is available & loaded)
    if (hasImg) {
      const imgW = 300;
      const imgH = 300;
      const imgX = cardX + 10;
      const imgY = cardY + floatY + 44;

      // Inner image frame with ultra-thin white border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 14);
      ctx.fill();
      ctx.stroke();

      // Clip product image with zero padding inside ultra-thin border
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX + 1, imgY + 1, imgW - 2, imgH - 2, 13);
      ctx.clip();
      ctx.drawImage(this.productImg, imgX + 1, imgY + 1, imgW - 2, imgH - 2);
      ctx.restore();
    }

    // Price Pill at bottom of corner card (ONLY if valid price is entered)
    if (hasSalePrice) {
      const saleStr = currencyFormatter.format(this.currentProduct.salePrice) + 'đ';
      ctx.fillStyle = '#FF2A54';
      ctx.font = 'bold 24px sans-serif';
      const priceY = hasImg ? (cardY + floatY + cardH - 12) : (cardY + floatY + 75);
      ctx.fillText(saleStr, cardX + 10, priceY);
    }

    ctx.restore();
  }

  renderFlashSaleBanner(ctx) {
    if (!this.showFlashSaleBanner || !this.currentProduct) return;

    ctx.save();
    const banX = 50;
    const banY = this.height - 480;
    const banW = this.width - 100;
    const banH = 110;

    // Bright Flash Sale Red/Gold Banner
    const grad = ctx.createLinearGradient(banX, 0, banX + banW, 0);
    grad.addColorStop(0, '#D00000');
    grad.addColorStop(1, '#FF3355');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(banX, banY, banW, banH, 20);
    ctx.fill();

    // Banner title text
    ctx.fillStyle = '#FFEC3D';
    ctx.font = 'bold 32px sans-serif';
    const bannerTitle = this.flashSaleTitle || '🔥 GIÁ LIVE ƯU ĐÃI';
    ctx.fillText(bannerTitle, banX + 30, banY + 45);

    // Pricing (ONLY if valid prices entered)
    const hasSale = typeof this.currentProduct.salePrice === 'number' && !isNaN(this.currentProduct.salePrice) && this.currentProduct.salePrice > 0;
    const hasOrig = typeof this.currentProduct.originalPrice === 'number' && !isNaN(this.currentProduct.originalPrice) && this.currentProduct.originalPrice > 0;

    if (hasSale) {
      const saleStr = currencyFormatter.format(this.currentProduct.salePrice) + 'đ';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(saleStr, banX + 30, banY + 92);
    }

    if (hasOrig) {
      const origStr = currencyFormatter.format(this.currentProduct.originalPrice) + 'đ';
      const origX = hasSale ? banX + 280 : banX + 30;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '26px sans-serif';
      ctx.fillText(origStr, origX, banY + 92);
      // Strike through original price
      const origW = ctx.measureText(origStr).width;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(origX, banY + 82);
      ctx.lineTo(origX + origW, banY + 82);
      ctx.stroke();
    }

    // Discount percentage badge (ONLY if discount is valid & positive)
    if (hasSale && hasOrig && this.currentProduct.originalPrice > this.currentProduct.salePrice) {
      const discountPercent = Math.round(((this.currentProduct.originalPrice - this.currentProduct.salePrice) / this.currentProduct.originalPrice) * 100);
      if (discountPercent > 0) {
        ctx.fillStyle = '#FFEC3D';
        ctx.beginPath();
        ctx.roundRect(banX + banW - 180, banY + 25, 150, 60, 15);
        ctx.fill();
        ctx.fillStyle = '#D00000';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(`-${discountPercent}%`, banX + banW - 155, banY + 66);
      }
    }

    ctx.restore();
  }

  // Dynamic 1-3 Line Subtitle Box with Pre-calculated Cached Layout
  renderSpeechSubtitle(ctx) {
    if (!this.showSubtitles || !this.speechText) return;

    const lines = this._cachedSubtitleLines && this._cachedSubtitleLines.length > 0 
      ? this._cachedSubtitleLines 
      : [this.speechText];

    ctx.save();
    const bubW = this.width - 100;
    const bubX = 50;

    // Subtitle Tag (Dynamic badge based on speech stage)
    const isLiveReply = this.speechStage === 'LIVE_REPLY' || this.speechStage === 'Reply';
    const tagText = isLiveReply ? '💬 TRẢ LỜI KHÁCH HÀNG' : '🎙️ MC TƯ VẤN LIVE';
    const tagBg = isLiveReply ? '#FF7A45' : '#FF2A54';
    const tagW = isLiveReply ? 230 : 170;

    const fontSize = this.speechText.length > 100 ? 21 : 23;
    const lineHeight = fontSize + 8;

    // Dynamic box height and Y position based on line count
    const bubH = lines.length === 3 ? 134 : (lines.length === 2 ? 106 : 76);
    const bubY = this.height - 230 - bubH;

    // Subtitle Glassmorphism Box
    ctx.fillStyle = 'rgba(6, 14, 25, 0.92)';
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubX, bubY, bubW, bubH, 20);
    ctx.fill();
    ctx.stroke();

    // Render Badge Tag
    ctx.fillStyle = tagBg;
    ctx.beginPath();
    ctx.roundRect(bubX + 20, bubY - 16, tagW, 32, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(tagText, bubX + 28, bubY + 5);

    // Render Subtitle Text Lines
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px sans-serif`;

    const startY = lines.length === 1 ? bubY + 48 : (lines.length === 2 ? bubY + 40 : bubY + 36);
    lines.forEach((l, idx) => {
      ctx.fillText(l.trim(), bubX + 22, startY + idx * lineHeight);
    });

    ctx.restore();
  }
}
