// Shopee Live 9:16 Vertical Video Renderer Engine

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
    this.flashTimeLeft = 450; // seconds

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
    this.productImg.crossOrigin = 'anonymous';
    this.productImg.src = product.image;
    this.productImg.onload = () => {
      this.isProductImgLoaded = true;
    };
  }

  setPresenterEngine(presenterEngine) {
    this.presenterEngine = presenterEngine;
  }

  setSpeechState(text, stage) {
    this.speechText = text;
    this.speechStage = stage;
  }

  initHearts() {
    for (let i = 0; i < 15; i++) {
      this.hearts.push({
        x: this.width - 120 + (Math.random() * 60 - 30),
        y: this.height - 300 - Math.random() * 500,
        size: 24 + Math.random() * 24,
        speedY: 2 + Math.random() * 3,
        alpha: Math.random(),
        color: ['#ff4d4f', '#ff7a45', '#ffec3d', '#ff85c0'][Math.floor(Math.random() * 4)]
      });
    }
  }

  update(delta = 0.016) {
    // Update hearts
    this.hearts.forEach(h => {
      h.y -= h.speedY;
      h.x += Math.sin(h.y * 0.02) * 1.5;
      h.alpha -= 0.005;
      if (h.y < this.height * 0.4 || h.alpha <= 0) {
        h.y = this.height - 250;
        h.x = this.width - 120 + (Math.random() * 60 - 30);
        h.alpha = 1;
      }
    });

    // Increment simulated likes
    if (Math.random() < 0.3) {
      this.likeCount += Math.floor(Math.random() * 3 + 1);
    }
  }

  render(timestamp = 0) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sleek Background (DinCox Navy Gradient)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGradient.addColorStop(0, '#060d19');
    bgGradient.addColorStop(0.5, '#0b1b36');
    bgGradient.addColorStop(1, '#050912');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle background glowing lights
    ctx.save();
    const glowGradient = ctx.createRadialGradient(
      this.width / 2, this.height * 0.35, 50,
      this.width / 2, this.height * 0.35, 500
    );
    glowGradient.addColorStop(0, 'rgba(229, 169, 60, 0.15)');
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    // 2. Render DinCox Product Display Spotlight Card (Middle)
    this.renderProductSpotlight(ctx, timestamp);

    // 3. Render AI Presenter Avatar (Lower Center)
    if (this.presenterEngine) {
      const presenterWidth = 620;
      const presenterHeight = 720;
      const presenterX = (this.width - presenterWidth) / 2;
      const presenterY = this.height - presenterHeight - 240;
      this.presenterEngine.render(ctx, presenterX, presenterY, presenterWidth, presenterHeight);
    }

    // 4. Render Shopee Live Header Overlay
    this.renderShopeeHeader(ctx);

    // 5. Render Speech Bubble / Script Subtitles
    if (this.speechText) {
      this.renderSpeechBubble(ctx);
    }

    // 6. Render Shopee Voucher & Flash Sale Timer Banner
    this.renderFlashSaleBanner(ctx);

    // 7. Render Shopee Bottom Left Cart & Buy Now Popups
    this.renderProductCardCart(ctx);

    // 8. Render Floating Hearts & Reaction Feed
    this.renderFloatingHearts(ctx);

    // 9. Render Live Chat Feed (Bottom Left)
    this.renderChatFeed(ctx);
  }

  renderProductSpotlight(ctx, timestamp) {
    if (!this.currentProduct) return;

    ctx.save();
    const cardX = 80;
    const cardY = 240;
    const cardW = this.width - 160;
    const cardH = 680;

    // Glowing container card
    ctx.fillStyle = 'rgba(15, 27, 48, 0.85)';
    ctx.strokeStyle = 'rgba(225, 175, 60, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.stroke();

    // Category Tag
    ctx.fillStyle = '#E5A93C';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('GIÀY CHUẨN EU - GIÁ ƯU VIỆT', cardX + 40, cardY + 60);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(this.currentProduct.name, cardX + 40, cardY + 115);

    // Product Image Showcase
    if (this.isProductImgLoaded) {
      const imgW = 460;
      const imgH = 460;
      const imgX = cardX + (cardW - imgW) / 2;
      const imgY = cardY + 140;

      // Floating animation for shoe
      const floatY = Math.sin(timestamp * 0.003) * 12;

      // Shadow below shoe
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(imgX + imgW / 2, imgY + imgH - 10, 180, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(this.productImg, imgX, imgY + floatY, imgW, imgH);
    }

    // Technology feature pill tags
    ctx.restore();
  }

  renderShopeeHeader(ctx) {
    ctx.save();

    // DinCox Shopee Mall Header Bar
    const barX = 40;
    const barY = 60;

    // Brand Avatar & Info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, 440, 90, 45);
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

    // Viewers Counter Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(this.width - 240, barY + 15, 200, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#FF4D4F';
    ctx.beginPath();
    ctx.arc(this.width - 210, barY + 45, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${this.viewCount} mắt xem`, this.width - 185, barY + 54);

    ctx.restore();
  }

  renderSpeechBubble(ctx) {
    ctx.save();
    const bubW = this.width - 120;
    const bubH = 140;
    const bubX = 60;
    const bubY = this.height - 640;

    // Glassmorphism Speech bubble box
    ctx.fillStyle = 'rgba(11, 25, 44, 0.92)';
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bubX, bubY, bubW, bubH, 24);
    ctx.fill();
    ctx.stroke();

    // Stage indicator tag
    ctx.fillStyle = '#FF2A54';
    ctx.beginPath();
    ctx.roundRect(bubX + 20, bubY - 20, 220, 40, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`MC AI STREAMER`, bubX + 35, bubY + 8);

    // Subtitle text wrapping
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px sans-serif';

    const words = this.speechText.split(' ');
    let line = '';
    let lineY = bubY + 65;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > bubW - 60 && i > 0) {
        ctx.fillText(line, bubX + 30, lineY);
        line = words[i] + ' ';
        lineY += 38;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, bubX + 30, lineY);

    ctx.restore();
  }

  renderFlashSaleBanner(ctx) {
    if (!this.currentProduct) return;

    ctx.save();
    const banX = 60;
    const banY = 940;
    const banW = this.width - 120;
    const banH = 110;

    // Bright Flash Sale Red/Gold Banner
    const grad = ctx.createLinearGradient(banX, 0, banX + banW, 0);
    grad.addColorStop(0, '#D00000');
    grad.addColorStop(1, '#FF4D4F');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(banX, banY, banW, banH, 20);
    ctx.fill();

    // Flash sale icon text
    ctx.fillStyle = '#FFEC3D';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`⚡ SHOPEE LIVE FLASH SALE`, banX + 30, banY + 50);

    // Pricing
    const saleStr = new Intl.NumberFormat('vi-VN').format(this.currentProduct.salePrice) + 'đ';
    const origStr = new Intl.NumberFormat('vi-VN').format(this.currentProduct.originalPrice) + 'đ';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(saleStr, banX + 30, banY + 95);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '28px sans-serif';
    ctx.fillText(origStr, banX + 300, banY + 95);
    // Strike through original price
    const origW = ctx.measureText(origStr).width;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(banX + 300, banY + 85);
    ctx.lineTo(banX + 300 + origW, banY + 85);
    ctx.stroke();

    // Discount percentage badge
    ctx.fillStyle = '#FFEC3D';
    ctx.beginPath();
    ctx.roundRect(banX + banW - 190, banY + 25, 160, 60, 15);
    ctx.fill();
    ctx.fillStyle = '#D00000';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`-${this.currentProduct.discountPercent}%`, banX + banW - 165, banY + 67);

    ctx.restore();
  }

  renderProductCardCart(ctx) {
    if (!this.currentProduct) return;

    ctx.save();
    // Orange Shopee Shopping Bag Button (Bottom Left)
    const cartX = 60;
    const cartY = this.height - 180;

    // Pulsing Shopee Orange Cart
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, 220, 100, 30);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('🛍️ Giỏ Hàng', cartX + 25, cartY + 60);

    // Stock Badge
    ctx.fillStyle = '#FFEC3D';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Chỉ còn ${this.currentProduct.stockCount} đôi!`, cartX + 25, cartY + 90);

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
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(this.width - 100, this.height - 130, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF4D4F';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('❤️', this.width - 120, this.height - 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText((this.likeCount / 1000).toFixed(1) + 'k', this.width - 125, this.height - 70);

    ctx.restore();
  }

  renderChatFeed(ctx) {
    ctx.save();
    const chatX = 300;
    const chatY = this.height - 240;

    ctx.font = '24px sans-serif';
    this.chatFeed.slice(0, 3).forEach((item, idx) => {
      const y = chatY + idx * 45;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(chatX, y, 680, 38, 12);
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
