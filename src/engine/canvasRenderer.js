// Authentic Shopee Live 9:16 Vertical Video Renderer Engine

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

    this.currentProduct = null;
    this.presenterEngine = null;
    this.speechText = '';
    this.speechStage = '';
    this.likeCount = 14890;
    this.viewCount = 3420;

    // Animated particles & hearts
    this.hearts = [];
    this.productImg = new Image();
    this.isProductImgLoaded = false;

    // Shopee Live simulated chat feed
    this.chatFeed = [
      { user: 'ThuTrang_99', text: 'Mẫu DC47 lót đi êm không ạ?' },
      { user: 'MinhQuang_Sneaker', text: 'Shop cho xem đế cao su với ạ!' },
      { user: 'HoangLong_Shopee', text: 'Đã áp mã voucher 50K chốt đơn thành công!' },
      { user: 'YenNhi_02', text: 'Có được freeship hông shop?' },
      { user: 'DucAnh_39', text: 'Giày chuẩn EU chất quá DinCox ơi ❤️' }
    ];

    this.initHearts();
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

  setSpeechState(text, stage) {
    this.speechText = text;
    this.speechStage = stage;
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
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. FULL-SCREEN BACKGROUND STREAMER (MC AI or Real MP4 Video fills 100% canvas background!)
    if (this.presenterEngine) {
      // Streamer occupies full height and width (0, 0, 1080, 1920)
      this.presenterEngine.render(ctx, 0, 0, this.width, this.height);
    } else {
      // Dark studio fallback gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGradient.addColorStop(0, '#060d19');
      bgGradient.addColorStop(0.5, '#0b1b36');
      bgGradient.addColorStop(1, '#050912');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Render Shopee Live Header Bar (Top Overlay)
    this.renderShopeeHeader(ctx);

    // 3. Render Floating Shoe Product Corner Badge Card (Upper Right)
    this.renderFloatingProductCorner(ctx, timestamp);

    // 4. Render Flash Sale & Voucher Banner (Lower Middle Overlay)
    this.renderFlashSaleBanner(ctx);

    // 5. Render Speech Subtitle Box (Above Comments)
    if (this.speechText) {
      this.renderSpeechSubtitle(ctx);
    }

    // 6. Render Shopee Bottom Left Cart & Stock Badge
    this.renderProductCardCart(ctx);

    // 7. Render Floating Hearts & Likes Counter
    this.renderFloatingHearts(ctx);

    // 8. Render Live Chat Feed (Bottom Left)
    this.renderChatFeed(ctx);
  }

  renderShopeeHeader(ctx) {
    ctx.save();
    const barX = 40;
    const barY = 60;

    // Brand Avatar & Info Container
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, 460, 90, 45);
    ctx.fill();

    // Red Shopee Mall Tag
    ctx.fillStyle = '#D00000';
    ctx.beginPath();
    ctx.roundRect(barX + 15, barY + 15, 120, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Mall', barX + 50, barY + 52);

    // Brand Name & Followers
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('DinCox Official', barX + 150, barY + 48);
    ctx.fillStyle = '#E5A93C';
    ctx.font = '22px sans-serif';
    ctx.fillText('★ 4.9 | 128.5K Người theo dõi', barX + 150, barY + 75);

    // Viewers Counter Badge (Top Right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(this.width - 260, barY + 15, 220, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#FF4D4F';
    ctx.beginPath();
    ctx.arc(this.width - 230, barY + 45, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${this.viewCount} mắt xem`, this.width - 205, barY + 54);

    ctx.restore();
  }

  // Authentic Shopee Floating Product Corner Card (Upper Right / Center Right)
  renderFloatingProductCorner(ctx, timestamp) {
    if (!this.currentProduct) return;

    ctx.save();
    // If image is loaded, card is 420px tall. If NO image, shrink card to 150px tall!
    const hasImg = this.isProductImgLoaded && this.currentProduct.image && typeof this.currentProduct.image === 'string' && this.currentProduct.image.trim().length > 0;
    const cardW = 340;
    const cardH = hasImg ? 420 : 150;
    const cardX = this.width - cardW - 40;
    const cardY = 180;

    // Subtle floating animation
    const floatY = Math.sin(timestamp * 0.003) * 6;

    // Glassmorphism card backdrop
    ctx.fillStyle = 'rgba(10, 20, 38, 0.88)';
    ctx.strokeStyle = 'rgba(229, 169, 60, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY + floatY, cardW, cardH, 24);
    ctx.fill();
    ctx.stroke();

    // Shopee Mall Badge Tag on Product Card
    ctx.fillStyle = '#D00000';
    ctx.beginPath();
    ctx.roundRect(cardX + 15, cardY + floatY + 15, 90, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Mall', cardX + 42, cardY + floatY + 38);

    // Product Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    const shortName = this.currentProduct.name.length > 22 
      ? this.currentProduct.name.substring(0, 20) + '...' 
      : this.currentProduct.name;
    ctx.fillText(shortName, cardX + 15, cardY + floatY + 76);

    // Shoe Product Thumbnail Box (ONLY if image is available & loaded)
    if (hasImg) {
      const imgW = 260;
      const imgH = 260;
      const imgX = cardX + (cardW - imgW) / 2;
      const imgY = cardY + floatY + 95;

      // Inner image frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 16);
      ctx.fill();

      ctx.drawImage(this.productImg, imgX + 10, imgY + 10, imgW - 20, imgH - 20);
    }

    // Price Pill at bottom of corner card
    const saleStr = new Intl.NumberFormat('vi-VN').format(this.currentProduct.salePrice) + 'đ';
    ctx.fillStyle = '#FF2A54';
    ctx.font = 'bold 26px sans-serif';
    const priceY = hasImg ? (cardY + floatY + cardH - 20) : (cardY + floatY + 124);
    ctx.fillText(saleStr, cardX + 15, priceY);

    ctx.restore();
  }

  renderFlashSaleBanner(ctx) {
    if (!this.currentProduct) return;

    ctx.save();
    const banX = 50;
    const banY = this.height - 620;
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

    // Flash sale icon text
    ctx.fillStyle = '#FFEC3D';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`⚡ SHOPEE LIVE FLASH SALE`, banX + 30, banY + 45);

    // Pricing
    const saleStr = new Intl.NumberFormat('vi-VN').format(this.currentProduct.salePrice) + 'đ';
    const origStr = new Intl.NumberFormat('vi-VN').format(this.currentProduct.originalPrice) + 'đ';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(saleStr, banX + 30, banY + 92);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '26px sans-serif';
    ctx.fillText(origStr, banX + 280, banY + 92);
    // Strike through original price
    const origW = ctx.measureText(origStr).width;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(banX + 280, banY + 82);
    ctx.lineTo(banX + 280 + origW, banY + 82);
    ctx.stroke();

    // Discount percentage badge
    ctx.fillStyle = '#FFEC3D';
    ctx.beginPath();
    ctx.roundRect(banX + banW - 180, banY + 25, 150, 60, 15);
    ctx.fill();
    ctx.fillStyle = '#D00000';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`-${this.currentProduct.discountPercent || 38}%`, banX + banW - 155, banY + 66);

    ctx.restore();
  }

  renderSpeechSubtitle(ctx) {
    ctx.save();
    const bubW = this.width - 100;
    const bubH = 120;
    const bubX = 50;
    const bubY = this.height - 490;

    // Subtitle Glassmorphism Box
    ctx.fillStyle = 'rgba(6, 14, 25, 0.9)';
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubX, bubY, bubW, bubH, 20);
    ctx.fill();
    ctx.stroke();

    // Subtitle Tag
    ctx.fillStyle = '#FF2A54';
    ctx.beginPath();
    ctx.roundRect(bubX + 20, bubY - 18, 200, 36, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`🎙️ MC TƯ VẤN LIVE`, bubX + 32, bubY + 6);

    // Text wrapping for subtitles
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '26px sans-serif';

    const words = this.speechText.split(' ');
    let line = '';
    let lineY = bubY + 55;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > bubW - 50 && i > 0) {
        ctx.fillText(line, bubX + 25, lineY);
        line = words[i] + ' ';
        lineY += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, bubX + 25, lineY);

    ctx.restore();
  }

  renderProductCardCart(ctx) {
    if (!this.currentProduct) return;

    ctx.save();
    // Orange Shopee Shopping Bag Button (Bottom Left)
    const cartX = 50;
    const cartY = this.height - 180;

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, 220, 100, 30);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('🛍️ Giỏ Hàng', cartX + 25, cartY + 60);

    // Stock Counter Badge
    ctx.fillStyle = '#FFEC3D';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Chỉ còn ${this.currentProduct.stockCount || 12} đôi!`, cartX + 25, cartY + 90);

    ctx.restore();
  }

  renderFloatingHearts(ctx) {
    ctx.save();
    this.hearts.forEach(h => {
      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;
      ctx.font = `${h.size}px sans-serif`;
      ctx.fillText('❤️', h.x, h.y);
    });

    // Like counter badge (Bottom Right)
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.arc(this.width - 90, this.height - 130, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF4D4F';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('❤️', this.width - 110, this.height - 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText((this.likeCount / 1000).toFixed(1) + 'k', this.width - 115, this.height - 70);

    ctx.restore();
  }

  renderChatFeed(ctx) {
    ctx.save();
    const chatX = 290;
    const chatY = this.height - 240;

    ctx.font = '24px sans-serif';
    this.chatFeed.slice(0, 3).forEach((item, idx) => {
      const y = chatY + idx * 45;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.roundRect(chatX, y, 690, 38, 12);
      ctx.fill();

      ctx.fillStyle = '#FFEC3D';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(item.user + ':', chatX + 15, y + 26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px sans-serif';
      ctx.fillText(item.text, chatX + 200, y + 26);
    });

    ctx.restore();
  }
}
