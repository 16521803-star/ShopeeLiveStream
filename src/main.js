import { createIcons, icons } from 'lucide';
import { 
  DINCOX_PRODUCTS, 
  PRESENTERS, 
  generateScriptForProduct, 
  addProductToCatalog, 
  updateProductInCatalog,
  toggleProductEnabled,
  clearAllProductsFromCatalog,
  moveProductInCatalog,
  getRandomTransitionPhrase,
  importShopeeOfficialCatalog, 
  importWebDincoxCatalog,
  parseBatchProductsList,
  saveProductScript,
  resetProductScript,
  exportAllScriptsJSON,
  importAllScriptsJSON
} from './data/dincoxCatalog.js';
import { speechEngine, audioCacheDB } from './engine/speechSynthesizer.js';
import { AIPresenterEngine } from './engine/aiPresenterEngine.js';
import { ShopeeCanvasRenderer } from './engine/canvasRenderer.js';
import { VideoExporter } from './engine/videoExporter.js';
import { ShopeeRtmpStreamer } from './engine/shopeeRtmpStreamer.js';

// Application State
let activeProduct = (DINCOX_PRODUCTS && DINCOX_PRODUCTS.length > 0) ? DINCOX_PRODUCTS[0] : null;
if (!activeProduct) {
  importWebDincoxCatalog();
  activeProduct = (DINCOX_PRODUCTS && DINCOX_PRODUCTS.length > 0) ? DINCOX_PRODUCTS[0] : null;
}
let activePresenter = PRESENTERS[0];
let currentScriptStages = generateScriptForProduct(activeProduct);
let activeStageIdx = 0;
let isSequencePlaying = false;
let recordedBlob = null;
let recordTimerInterval = null;
let recordSeconds = 0;
let customUploadedImageDataUrl = null;

// Initialize Core Engines
const canvas = document.getElementById('shopee-canvas');
const canvasRenderer = new ShopeeCanvasRenderer(canvas);
const presenterEngine = new AIPresenterEngine(activePresenter);
const videoExporter = new VideoExporter(canvas);
const rtmpStreamer = new ShopeeRtmpStreamer(canvas);

canvasRenderer.setPresenterEngine(presenterEngine);
if (activeProduct) {
  canvasRenderer.setProduct(activeProduct);
}

// Animation Loop
let lastTime = 0;
function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  presenterEngine.update(speechEngine.simulatedVolume);
  canvasRenderer.update(delta);
  canvasRenderer.render(time);

  requestAnimationFrame(animate);
}

// UI Renderers
function renderProductList() {
  const container = document.getElementById('product-selector');

  if (!DINCOX_PRODUCTS || DINCOX_PRODUCTS.length === 0) {
    container.innerHTML = `
      <div class="empty-product-box">
        <p>🧹 Danh sách sản phẩm hiện đang trống.</p>
        <span class="sub-hint">Bấm nút Import từ dincox.com / Shopee Mall hoặc bấm "+ Nhập / Thêm Danh Sách Giày Mới" bên dưới để thêm sản phẩm thủ công.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = DINCOX_PRODUCTS.map((prod, idx) => `
    <div class="product-item-card ${activeProduct && prod.id === activeProduct.id ? 'active' : ''} ${prod.enabled === false ? 'disabled' : ''}" data-id="${prod.id}">
      <input type="checkbox" class="prod-checkbox" data-id="${prod.id}" ${prod.enabled !== false ? 'checked' : ''} title="Bật/Tắt mẫu này khi lặp kịch bản">
      ${prod.image && typeof prod.image === 'string' && prod.image.trim() 
        ? `<img src="${prod.image}" alt="${prod.name}" class="product-thumb">` 
        : `<div class="product-thumb no-img-thumb" style="display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border-radius:8px; font-size:22px;" title="Sản phẩm không hình ảnh">👟</div>`}
      <div class="product-info flex-1">
        <h3>${prod.name}</h3>
        <div class="product-prices">
          <span class="sale-price">${new Intl.NumberFormat('vi-VN').format(prod.salePrice)}đ</span>
          <span class="orig-price">${new Intl.NumberFormat('vi-VN').format(prod.originalPrice)}đ</span>
        </div>
      </div>
      <button class="btn-edit-prod" data-id="${prod.id}" title="Chỉnh sửa giá & thông tin">✏️ Sửa</button>
      <div class="prod-reorder-btns">
        <button class="btn-move-prod" data-id="${prod.id}" data-dir="up" ${idx === 0 ? 'disabled' : ''} title="Di chuyển lên">▲</button>
        <button class="btn-move-prod" data-id="${prod.id}" data-dir="down" ${idx === DINCOX_PRODUCTS.length - 1 ? 'disabled' : ''} title="Di chuyển xuống">▼</button>
      </div>
    </div>
  `).join('');

  // Select Product click
  container.querySelectorAll('.product-item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('prod-checkbox') || e.target.classList.contains('btn-edit-prod') || e.target.classList.contains('btn-move-prod')) return;
      const id = card.dataset.id;
      const found = DINCOX_PRODUCTS.find(p => p.id === id);
      if (found) {
        selectProduct(found);
      }
    });
  });

  // Enable/Disable Checkbox toggle
  container.querySelectorAll('.prod-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      e.stopPropagation();
      const id = chk.dataset.id;
      toggleProductEnabled(id, chk.checked);
      renderProductList();
    });
  });

  // Edit Product button
  container.querySelectorAll('.btn-edit-prod').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      openEditModal(id);
    });
  });

  // Move Product Up/Down buttons
  container.querySelectorAll('.btn-move-prod').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const dir = btn.dataset.dir;
      if (moveProductInCatalog(id, dir)) {
        renderProductList();
      }
    });
  });
}

function selectProduct(product) {
  activeProduct = product;
  currentScriptStages = generateScriptForProduct(activeProduct);
  activeStageIdx = 0;

  canvasRenderer.setProduct(activeProduct);
  renderProductList();
  renderScriptTabs();
  renderTimelineSteps();
  loadCurrentStageText();
}

function renderPresenterList() {
  const container = document.getElementById('presenter-selector');
  container.innerHTML = PRESENTERS.map(p => `
    <div class="presenter-card ${p.id === activePresenter.id ? 'active' : ''}" data-id="${p.id}">
      <img src="${p.avatar}" alt="${p.name}" class="presenter-avatar">
      <div class="presenter-name">${p.name}</div>
    </div>
  `).join('');

  container.querySelectorAll('.presenter-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const found = PRESENTERS.find(p => p.id === id);
      if (found) {
        activePresenter = found;
        presenterEngine.setPresenter(activePresenter);
        renderPresenterList();
      }
    });
  });
}

function renderScriptTabs() {
  const container = document.getElementById('script-stage-tabs');
  container.innerHTML = currentScriptStages.map((st, idx) => `
    <button class="stage-tab ${idx === activeStageIdx ? 'active' : ''}" data-idx="${idx}">
      ${idx + 1}. ${st.stage}
    </button>
  `).join('');

  container.querySelectorAll('.stage-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeStageIdx = parseInt(tab.dataset.idx, 10);
      renderScriptTabs();
      renderTimelineSteps();
      loadCurrentStageText();
    });
  });
}

function renderTimelineSteps() {
  const container = document.getElementById('timeline-stepper');
  container.innerHTML = currentScriptStages.map((st, idx) => `
    <div class="step-item ${idx === activeStageIdx ? 'active' : ''}">
      <div class="step-num">${idx + 1}</div>
      <div class="step-details">
        <strong>${st.stage}</strong>
        <p>${st.text.substring(0, 45)}...</p>
      </div>
    </div>
  `).join('');
}

function loadCurrentStageText() {
  const txtArea = document.getElementById('script-text-input');
  if (currentScriptStages[activeStageIdx]) {
    txtArea.value = currentScriptStages[activeStageIdx].text;
    canvasRenderer.setSpeechState(currentScriptStages[activeStageIdx].text, currentScriptStages[activeStageIdx].stage);
  }
}

// Edit Modal Functions
function openEditModal(productId) {
  const prod = DINCOX_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('edit-prod-id').value = prod.id;
  document.getElementById('edit-prod-name').value = prod.name;
  document.getElementById('edit-orig-price').value = prod.originalPrice;
  document.getElementById('edit-sale-price').value = prod.salePrice;
  document.getElementById('edit-stock-count').value = prod.stockCount || 10;
  document.getElementById('edit-feature').value = (prod.features && prod.features[0]) ? prod.features[0] : '';

  document.getElementById('edit-modal-backdrop').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal-backdrop').classList.add('hidden');
}

function saveEditModal() {
  const id = document.getElementById('edit-prod-id').value;
  const name = document.getElementById('edit-prod-name').value;
  const orig = parseInt(document.getElementById('edit-orig-price').value, 10);
  const sale = parseInt(document.getElementById('edit-sale-price').value, 10);
  const stock = parseInt(document.getElementById('edit-stock-count').value, 10);
  const feature = document.getElementById('edit-feature').value;

  const updated = updateProductInCatalog(id, {
    name,
    originalPrice: orig,
    salePrice: sale,
    stockCount: stock,
    features: [feature, 'Công nghệ đế cao su lưu hóa (Vulcanized) chống trượt', 'Bảo hành 12 tháng chính hãng Shopee Mall']
  });

  if (updated && activeProduct.id === id) {
    selectProduct(updated);
  } else {
    renderProductList();
  }

  closeEditModal();
}

// Play script sequence automatically stage by stage
function playScriptSequence() {
  if (isSequencePlaying) {
    speechEngine.stop();
    isSequencePlaying = false;
    document.getElementById('btn-play-full-sequence').innerHTML = `<i data-lucide="play"></i> Phát Kịch Bản Tự Động`;
    createIcons({ icons });
    return;
  }

  isSequencePlaying = true;
  document.getElementById('btn-play-full-sequence').innerHTML = `<i data-lucide="square"></i> Dừng Kịch Bản`;
  createIcons({ icons });

  activeStageIdx = 0;
  playNextStageInSequence();
}

function playNextStageInSequence() {
  const isLoopAll = document.getElementById('chk-loop-all-products').checked;

  if (!isSequencePlaying) {
    document.getElementById('btn-play-full-sequence').innerHTML = `<i data-lucide="play"></i> Phát Kịch Bản Tự Động`;
    createIcons({ icons });
    return;
  }

  if (activeStageIdx >= currentScriptStages.length) {
    const enabledProducts = DINCOX_PRODUCTS.filter(p => p.enabled !== false);
    if (isLoopAll && enabledProducts.length > 0) {
      // Loop to next enabled product with a natural transition phrase
      const previousProd = activeProduct;
      const currentProdIdx = enabledProducts.findIndex(p => p.id === activeProduct.id);
      const nextProdIdx = (currentProdIdx + 1) % enabledProducts.length;
      const nextProd = enabledProducts[nextProdIdx];

      const transitionText = getRandomTransitionPhrase(previousProd, nextProd);
      canvasRenderer.setSpeechState(transitionText, 'Transition');

      speechEngine.speak(transitionText, {
        pitch: activePresenter.voicePitch,
        rate: activePresenter.voiceRate,
        gender: activePresenter.gender,
        onEnd: () => {
          if (isSequencePlaying) {
            selectProduct(nextProd);
            activeStageIdx = 0;
            setTimeout(() => playNextStageInSequence(), 600);
          }
        }
      });
      return;
    } else {
      isSequencePlaying = false;
      document.getElementById('btn-play-full-sequence').innerHTML = `<i data-lucide="play"></i> Phát Kịch Bản Tự Động`;
      createIcons({ icons });
      return;
    }
  }

  renderScriptTabs();
  renderTimelineSteps();
  loadCurrentStageText();

  const currentStage = currentScriptStages[activeStageIdx];
  speechEngine.speak(currentStage.text, {
    pitch: activePresenter.voicePitch,
    rate: activePresenter.voiceRate,
    gender: activePresenter.gender,
    onEnd: () => {
      if (isSequencePlaying) {
        activeStageIdx++;
        setTimeout(() => playNextStageInSequence(), 800);
      }
    }
  });
}

// Video Recording Controller
async function toggleVideoRecording() {
  const btn = document.getElementById('btn-start-record');
  const progressBox = document.getElementById('recording-progress');
  const recordText = document.getElementById('record-time-text');
  const downloadBtn = document.getElementById('btn-download-video');

  if (!videoExporter.isRecording) {
    // Start Recording
    videoExporter.startRecording();
    btn.innerHTML = `<i data-lucide="square"></i> Dừng Quay & Xuất Video`;
    btn.classList.replace('btn-danger', 'btn-secondary');
    progressBox.classList.remove('hidden');
    downloadBtn.classList.add('hidden');
    createIcons({ icons });

    recordSeconds = 0;
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
      const secs = String(recordSeconds % 60).padStart(2, '0');
      recordText.innerText = `Đang quay video: ${mins}:${secs}`;
    }, 1000);

    if (!isSequencePlaying) {
      playScriptSequence();
    }
  } else {
    // Stop Recording
    clearInterval(recordTimerInterval);
    recordedBlob = await videoExporter.stopRecording();
    btn.innerHTML = `<i data-lucide="disc"></i> Quay & Xuất Video`;
    btn.classList.replace('btn-secondary', 'btn-danger');
    progressBox.classList.add('hidden');
    downloadBtn.classList.remove('hidden');
    createIcons({ icons });
  }
}

// Bind Events
function bindEvents() {
  document.getElementById('script-text-input').addEventListener('input', (e) => {
    if (currentScriptStages[activeStageIdx]) {
      currentScriptStages[activeStageIdx].text = e.target.value;
      canvasRenderer.setSpeechState(e.target.value, currentScriptStages[activeStageIdx].stage);
      // Auto-save script changes to localStorage immediately
      saveProductScript(activeProduct.id, currentScriptStages);
    }
  });

  document.getElementById('btn-preview-speech').addEventListener('click', () => {
    const text = document.getElementById('script-text-input').value;
    const apiKey = document.getElementById('elevenlabs-api-key')?.value?.trim();
    const isEnabled = document.getElementById('chk-use-elevenlabs')?.checked;

    if (!apiKey && isEnabled) {
      alert("⚠️ Lưu ý: Bạn chưa nhập API Key ElevenLabs!\n\nHệ thống sẽ tạm thời đọc thử bằng Giọng Mặc Định của Trình Duyệt. Để sử dụng giọng nữ siêu thực của ElevenLabs, vui lòng mở khung 'Giọng Đọc Siêu Thực ElevenLabs' bên dưới và dán API Key của bạn vào nhé.");
    } else if (!isEnabled) {
      alert("⚠️ Lưu ý: Bạn đang TẮT tùy chọn ElevenLabs AI Voice.\n\nHệ thống sẽ đọc bằng giọng mặc định trình duyệt. Nếu muốn dùng ElevenLabs, hãy tích chọn 'Ưu tiên phát bằng giọng đọc ElevenLabs' bên dưới.");
    }

    speechEngine.speak(text, {
      pitch: activePresenter.voicePitch,
      rate: activePresenter.voiceRate,
      gender: activePresenter.gender
    });
  });

  document.getElementById('btn-stop-speech').addEventListener('click', () => {
    speechEngine.stop();
  });

  // Export All Scripts to JSON
  document.getElementById('btn-export-script').addEventListener('click', () => {
    const jsonStr = exportAllScriptsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dincox_shopee_scripts_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import Scripts from JSON File
  const fileInput = document.getElementById('script-file-input');
  document.getElementById('btn-import-script').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const count = importAllScriptsJSON(evt.target.result);
        if (count > 0) {
          selectProduct(activeProduct);
          alert(`🎉 Đã nạp thành công kịch bản mới cho ${count} sản phẩm!`);
        }
      };
      reader.readAsText(file);
    }
  });

  // Reset current script to default
  document.getElementById('btn-regen-script').addEventListener('click', () => {
    if (confirm("Khôi phục kịch bản mặc định cho sản phẩm này? Các chỉnh sửa cá nhân sẽ bị xóa.")) {
      resetProductScript(activeProduct.id);
      currentScriptStages = generateScriptForProduct(activeProduct);
      renderScriptTabs();
      renderTimelineSteps();
      loadCurrentStageText();
    }
  });

  document.getElementById('btn-play-full-sequence').addEventListener('click', playScriptSequence);
  document.getElementById('btn-start-record').addEventListener('click', toggleVideoRecording);

  document.getElementById('btn-download-video').addEventListener('click', () => {
    if (recordedBlob) {
      videoExporter.downloadVideo(recordedBlob, `DinCox_ShopeeLive_${activeProduct.id}.webm`);
    }
  });

  document.getElementById('btn-obs-mode').addEventListener('click', () => {
    alert("Dán đường dẫn bên dưới vào nguồn Browser Source trong OBS Studio:\n" + window.location.href);
  });

  // Custom Product Form Toggle & Tabs
  document.getElementById('toggle-custom-product').addEventListener('click', () => {
    document.getElementById('custom-product-form').classList.toggle('hidden');
  });

  const tabSingle = document.getElementById('tab-single-prod');
  const tabBatch = document.getElementById('tab-batch-prod');
  const singleContainer = document.getElementById('single-prod-container');
  const batchContainer = document.getElementById('batch-prod-container');

  tabSingle.addEventListener('click', () => {
    tabSingle.classList.add('active');
    tabBatch.classList.remove('active');
    singleContainer.classList.remove('hidden');
    batchContainer.classList.add('hidden');
  });

  tabBatch.addEventListener('click', () => {
    tabBatch.classList.add('active');
    tabSingle.classList.remove('active');
    batchContainer.classList.remove('hidden');
    singleContainer.classList.add('hidden');
  });

  // Custom MC Video MP4 Upload Reader
  document.getElementById('mc-video-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoObjectUrl = URL.createObjectURL(file);
      presenterEngine.loadVideoSource(videoObjectUrl);
      alert("🎥 Đã nạp thành công Video MP4 MC Người Thật! Video sẽ tự động lặp trên khung Shopee Live 9:16.");
    }
  });
  document.getElementById('cust-img-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        customUploadedImageDataUrl = evt.target.result;
        const previewBox = document.getElementById('cust-img-preview');
        previewBox.innerHTML = `<img src="${customUploadedImageDataUrl}" alt="Preview">`;
        previewBox.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // 1-Click Shopee Official Store Importer
  document.getElementById('btn-import-shopee').addEventListener('click', () => {
    const count = importShopeeOfficialCatalog();
    renderProductList();
    if (DINCOX_PRODUCTS.length > 0) {
      selectProduct(DINCOX_PRODUCTS[DINCOX_PRODUCTS.length - 1]);
    }
    alert(`⚡ Đã import thành công ${count} sản phẩm mới từ Shopee Mall DinCox Official Store!`);
  });

  // 1-Click dincox.com Web Importer
  document.getElementById('btn-import-web').addEventListener('click', () => {
    const count = importWebDincoxCatalog();
    renderProductList();
    if (DINCOX_PRODUCTS.length > 0) {
      selectProduct(DINCOX_PRODUCTS[DINCOX_PRODUCTS.length - 1]);
    }
    alert(`🌐 Đã load thành công ${count} sản phẩm trực tiếp từ trang web dincox.com!`);
  });

  // Export All Products Catalog to JSON
  const btnExportProdJson = document.getElementById('btn-export-prod-json');
  if (btnExportProdJson) {
    btnExportProdJson.addEventListener('click', () => {
      const jsonStr = exportAllProductsCatalogJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dincox_products_catalog_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import Products Catalog from JSON File
  const prodFileInput = document.getElementById('prod-json-file-input');
  const btnImportProdJson = document.getElementById('btn-import-prod-json');
  if (btnImportProdJson && prodFileInput) {
    btnImportProdJson.addEventListener('click', () => {
      prodFileInput.click();
    });

    prodFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const count = importAllProductsCatalogJSON(evt.target.result);
          if (count > 0) {
            renderProductList();
            if (DINCOX_PRODUCTS.length > 0) {
              selectProduct(DINCOX_PRODUCTS[0]);
            }
            alert(`🎉 Đã nạp thành công ${count} sản phẩm mới từ tệp JSON!`);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Clear/Reset All Products Catalog
  const btnResetCatalog = document.getElementById('btn-reset-catalog');
  if (btnResetCatalog) {
    btnResetCatalog.addEventListener('click', () => {
      if (confirm("⚠️ Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách?")) {
        clearAllProductsFromCatalog();
        renderProductList();
        alert("🧹 Đã xóa toàn bộ sản phẩm! Bạn có thể thêm sản phẩm mới thủ công hoặc import lại.");
      }
    });
  }

  // Single Product Adder
  document.getElementById('btn-apply-custom').addEventListener('click', () => {
    const name = document.getElementById('cust-name').value || 'Giày DinCox Mới';
    const orig = parseInt(document.getElementById('cust-orig-price').value, 10) || 750000;
    const sale = parseInt(document.getElementById('cust-sale-price').value, 10) || 450000;
    const feat = document.getElementById('cust-feature').value || 'Lót Latex Memory Foam siêu êm';

    const customProd = {
      id: 'custom_' + Date.now(),
      enabled: true,
      name,
      code: 'DC-CUST-' + Math.floor(Math.random() * 90 + 10),
      category: 'Giày DinCox Tùy Chỉnh',
      originalPrice: orig,
      salePrice: sale,
      discountPercent: Math.round(((orig - sale) / orig) * 100),
      voucherCode: 'DINCOX50K',
      voucherValue: '50.000đ',
      image: customUploadedImageDataUrl || '/assets/dincox_dc47.png',
      stockCount: 10,
      features: [feat, 'Công nghệ đế cao su lưu hóa (Vulcanized) 100% bám đường', 'Bảo hành 12 tháng chính hãng Shopee Mall']
    };

    addProductToCatalog(customProd);
    renderProductList();
    selectProduct(customProd);

    // Reset inputs
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-orig-price').value = '';
    document.getElementById('cust-sale-price').value = '';
    document.getElementById('cust-feature').value = '';
    document.getElementById('cust-img-file').value = '';
    document.getElementById('cust-img-preview').classList.add('hidden');
    customUploadedImageDataUrl = null;
  });

  // Batch List Importer
  document.getElementById('btn-apply-batch').addEventListener('click', () => {
    const rawText = document.getElementById('batch-text-input').value;
    const parsed = parseBatchProductsList(rawText);
    if (parsed.length > 0) {
      renderProductList();
      selectProduct(parsed[0]);
      alert(`🎉 Đã import thành công danh sách ${parsed.length} mẫu giày mới vào hệ thống!`);
      document.getElementById('batch-text-input').value = '';
    } else {
      alert("Vui lòng nhập đúng định dạng: Tên Giày | Giá Gốc | Giá Live | Tính Năng");
    }
  });

  // Edit Modal Controls
  document.getElementById('btn-close-modal').addEventListener('click', closeEditModal);
  document.getElementById('btn-save-edit-prod').addEventListener('click', saveEditModal);

  // Direct Shopee RTMP Broadcaster Controls
  const btnStartRtmp = document.getElementById('btn-start-rtmp');
  const btnStopRtmp = document.getElementById('btn-stop-rtmp');
  const statusBadge = document.getElementById('rtmp-status-badge');
  const keyInput = document.getElementById('rtmp-key-input');

  // Auto-restore saved Stream Key from localStorage
  const savedKey = localStorage.getItem('dincox_shopee_stream_key');
  if (savedKey && keyInput) {
    keyInput.value = savedKey;
  }

  if (btnStartRtmp && btnStopRtmp) {
    btnStartRtmp.addEventListener('click', () => {
      const url = document.getElementById('rtmp-url-input').value;
      const key = keyInput.value.trim();

      if (!key) {
        alert("⚠️ Vui lòng nhập Mã Khóa Luồng (Stream Key) lấy từ Shopee Live Seller Center!");
        return;
      }

      // Save key for future sessions
      localStorage.setItem('dincox_shopee_stream_key', key);

      rtmpStreamer.setCredentials(url, key);
      const success = rtmpStreamer.startStream((status, msg) => {
        statusBadge.className = 'rtmp-status-badge';
        if (status === 'LIVE') {
          statusBadge.classList.add('status-live');
          statusBadge.innerText = '🔴 ĐANG PHÁT LIVE SHOPEE';
          btnStartRtmp.classList.add('hidden');
          btnStopRtmp.classList.remove('hidden');
        } else if (status === 'ERROR') {
          statusBadge.classList.add('status-error');
          statusBadge.innerText = '⚠️ ' + msg;
        } else {
          statusBadge.classList.add('status-idle');
          statusBadge.innerText = '● ' + msg;
          btnStartRtmp.classList.remove('hidden');
          btnStopRtmp.classList.add('hidden');
        }
      });

      if (success && !isSequencePlaying) {
        playScriptSequence();
      }
    });

    btnStopRtmp.addEventListener('click', () => {
      rtmpStreamer.stopStream();
      btnStartRtmp.classList.remove('hidden');
      btnStopRtmp.classList.add('hidden');
    });
  }

  // ElevenLabs High Quality Voice Integration Controls
  const toggleElevenLabsBtn = document.getElementById('toggle-elevenlabs');
  const elevenLabsForm = document.getElementById('elevenlabs-form');
  const elevenLabsApiKeyInput = document.getElementById('elevenlabs-api-key');
  const elevenLabsVoiceSelect = document.getElementById('elevenlabs-voice-select');
  const elevenLabsVoiceIdInput = document.getElementById('elevenlabs-voice-id');
  const customVoiceIdContainer = document.getElementById('custom-voice-id-container');
  const elevenLabsModelSelect = document.getElementById('elevenlabs-model');
  const btnFetchElevenVoices = document.getElementById('btn-fetch-eleven-voices');
  const chkUseElevenLabs = document.getElementById('chk-use-elevenlabs');
  const chkConfirmElevenLabs = document.getElementById('chk-confirm-elevenlabs');

  // Restore saved ElevenLabs settings from localStorage
  const savedElevenKey = localStorage.getItem('dincox_elevenlabs_key');
  const savedElevenVoice = localStorage.getItem('dincox_elevenlabs_voice');
  const savedElevenModel = localStorage.getItem('dincox_elevenlabs_model');
  const savedElevenEnabledVal = localStorage.getItem('dincox_elevenlabs_enabled');
  const savedElevenEnabled = savedElevenEnabledVal === null ? true : (savedElevenEnabledVal === 'true');
  const savedElevenConfirmVal = localStorage.getItem('dincox_elevenlabs_confirm');
  const savedElevenConfirm = savedElevenConfirmVal === null ? true : (savedElevenConfirmVal === 'true');

  if (savedElevenKey && elevenLabsApiKeyInput) elevenLabsApiKeyInput.value = savedElevenKey;
  if (savedElevenModel && elevenLabsModelSelect) elevenLabsModelSelect.value = savedElevenModel;
  if (chkUseElevenLabs) chkUseElevenLabs.checked = savedElevenEnabled;
  if (chkConfirmElevenLabs) chkConfirmElevenLabs.checked = savedElevenConfirm;

  // Restore Voice Selection
  if (savedElevenVoice && elevenLabsVoiceSelect) {
    const matchingOption = Array.from(elevenLabsVoiceSelect.options).find(opt => opt.value === savedElevenVoice);
    if (matchingOption) {
      elevenLabsVoiceSelect.value = savedElevenVoice;
    } else {
      elevenLabsVoiceSelect.value = 'custom';
      if (customVoiceIdContainer) customVoiceIdContainer.classList.remove('hidden');
      if (elevenLabsVoiceIdInput) elevenLabsVoiceIdInput.value = savedElevenVoice;
    }
  }

  const getEffectiveVoiceId = () => {
    if (!elevenLabsVoiceSelect) return '21m00Tcm4TlvDq8ikWAM';
    if (elevenLabsVoiceSelect.value === 'custom') {
      return elevenLabsVoiceIdInput ? elevenLabsVoiceIdInput.value.trim() : '';
    }
    return elevenLabsVoiceSelect.value;
  };

  const updateElevenLabsSettings = () => {
    const apiKey = elevenLabsApiKeyInput ? elevenLabsApiKeyInput.value.trim() : '';
    const voiceId = getEffectiveVoiceId();
    const modelId = elevenLabsModelSelect ? elevenLabsModelSelect.value : 'eleven_multilingual_v2';
    const enabled = chkUseElevenLabs ? chkUseElevenLabs.checked : false;
    const confirmBeforeApiCall = chkConfirmElevenLabs ? chkConfirmElevenLabs.checked : true;

    localStorage.setItem('dincox_elevenlabs_key', apiKey);
    localStorage.setItem('dincox_elevenlabs_voice', voiceId);
    localStorage.setItem('dincox_elevenlabs_model', modelId);
    localStorage.setItem('dincox_elevenlabs_enabled', enabled ? 'true' : 'false');
    localStorage.setItem('dincox_elevenlabs_confirm', confirmBeforeApiCall ? 'true' : 'false');

    speechEngine.setElevenLabsConfig({ apiKey, voiceId, modelId, enabled, confirmBeforeApiCall });

    const statusEl = document.getElementById('elevenlabs-live-status');
    if (statusEl) {
      if (enabled && apiKey) {
        let voiceName = voiceId;
        if (elevenLabsVoiceSelect && elevenLabsVoiceSelect.selectedOptions[0]) {
          voiceName = elevenLabsVoiceSelect.selectedOptions[0].text;
        }
        statusEl.className = 'elevenlabs-status-badge status-active';
        statusEl.style.color = '#10b981';
        statusEl.innerHTML = `🟢 Đang dùng ElevenLabs AI: <strong>${voiceName}</strong>`;
      } else if (enabled && !apiKey) {
        statusEl.className = 'elevenlabs-status-badge status-warning';
        statusEl.style.color = '#f59e0b';
        statusEl.innerHTML = `⚠️ Vui lòng nhập API Key ElevenLabs bên trên để kích hoạt giọng AI siêu thực`;
      } else {
        statusEl.className = 'elevenlabs-status-badge status-idle';
        statusEl.style.color = '#9ca3af';
        statusEl.innerHTML = `⚪ Đang tắt ElevenLabs (Sử dụng giọng mặc định trình duyệt WebSpeech)`;
      }
    }
  };

  // Bind Real-Time Cache / Credit Status Callback
  speechEngine.onStatusCallback = (info) => {
    const statusEl = document.getElementById('elevenlabs-live-status');
    if (!statusEl) return;

    if (info.isCache) {
      statusEl.className = 'elevenlabs-status-badge status-active';
      statusEl.style.color = '#10b981';
      statusEl.innerHTML = `⚡ <strong>[CACHE HIT - 0 CREDIT]</strong> Phát từ ${info.source}`;
    } else {
      statusEl.className = 'elevenlabs-status-badge status-warning';
      statusEl.style.color = '#f59e0b';
      statusEl.innerHTML = `📡 <strong>[API CALL - ~${info.costCredits} Credits]</strong> Gọi ElevenLabs API & Lưu Cache`;
    }
  };

  // Initial Sync
  updateElevenLabsSettings();

  if (toggleElevenLabsBtn && elevenLabsForm) {
    toggleElevenLabsBtn.addEventListener('click', () => {
      elevenLabsForm.classList.toggle('hidden');
    });
  }

  if (elevenLabsApiKeyInput) {
    elevenLabsApiKeyInput.addEventListener('input', () => {
      if (elevenLabsApiKeyInput.value.trim() && chkUseElevenLabs && !chkUseElevenLabs.checked) {
        chkUseElevenLabs.checked = true;
      }
      updateElevenLabsSettings();
    });
  }

  if (chkUseElevenLabs) {
    chkUseElevenLabs.addEventListener('change', updateElevenLabsSettings);
  }

  if (chkConfirmElevenLabs) {
    chkConfirmElevenLabs.addEventListener('change', updateElevenLabsSettings);
  }

  if (elevenLabsModelSelect) {
    elevenLabsModelSelect.addEventListener('change', updateElevenLabsSettings);
  }

  if (elevenLabsVoiceIdInput) {
    elevenLabsVoiceIdInput.addEventListener('input', updateElevenLabsSettings);
  }

  if (elevenLabsVoiceSelect) {
    elevenLabsVoiceSelect.addEventListener('change', () => {
      if (elevenLabsVoiceSelect.value === 'custom') {
        customVoiceIdContainer.classList.remove('hidden');
      } else {
        customVoiceIdContainer.classList.add('hidden');
      }
      updateElevenLabsSettings();
    });
  }

  if (btnFetchElevenVoices) {
    btnFetchElevenVoices.addEventListener('click', async () => {
      const apiKey = elevenLabsApiKeyInput ? elevenLabsApiKeyInput.value.trim() : '';
      if (!apiKey) {
        alert("⚠️ Vui lòng nhập API Key ElevenLabs trước khi tải danh sách giọng!");
        return;
      }

      btnFetchElevenVoices.innerHTML = `<i data-lucide="refresh-cw" class="spin"></i> Đang tải...`;
      const accountVoices = await speechEngine.fetchElevenLabsUserVoices(apiKey, true);
      const sharedViVoices = await speechEngine.fetchElevenLabsVietnameseSharedVoices(apiKey);
      btnFetchElevenVoices.innerHTML = `<i data-lucide="refresh-cw"></i> 🔄 Tải Giọng Account`;
      createIcons({ icons });

      // Remove previous fetched groups if any
      elevenLabsVoiceSelect.querySelectorAll('.fetched-group').forEach(el => el.remove());

      const clonedVoices = accountVoices.filter(v => (v.category || '').toLowerCase().includes('cloned') || (v.category || '').toLowerCase().includes('generated') || (v.category || '').toLowerCase().includes('professional'));
      let totalCount = 0;

      if (clonedVoices.length > 0) {
        const clonedGroup = document.createElement('optgroup');
        clonedGroup.label = "🌟 Giọng Clone Tiếng Việt Trong Account (Voice Lab)";
        clonedGroup.className = "fetched-group";
        clonedGroup.innerHTML = clonedVoices.map(v => `
          <option value="${v.voice_id}">${v.name} (Giọng Clone Của Bạn)</option>
        `).join('');
        elevenLabsVoiceSelect.insertBefore(clonedGroup, elevenLabsVoiceSelect.firstChild);
        totalCount += clonedVoices.length;
      }

      if (sharedViVoices && sharedViVoices.length > 0) {
        const viGroup = document.createElement('optgroup');
        viGroup.label = "🇻🇳 Giọng Đọc Tiếng Việt Chuẩn (Cộng Đồng ElevenLabs)";
        viGroup.className = "fetched-group";
        viGroup.innerHTML = sharedViVoices.map(v => `
          <option value="${v.voice_id}">${v.name} (Tiếng Việt ${v.gender || 'Native'})</option>
        `).join('');
        elevenLabsVoiceSelect.insertBefore(viGroup, elevenLabsVoiceSelect.firstChild);
        totalCount += sharedViVoices.length;
      }

      if (totalCount > 0) {
        alert(`🎉 Đã nạp thành công ${totalCount} giọng đọc Tiếng Việt & Giọng Clone từ ElevenLabs!`);
        updateElevenLabsSettings();
      } else {
        alert("💡 Gợi ý: Bạn chưa tạo Giọng Clone Tiếng Việt trong tài khoản ElevenLabs!\n\nHướng dẫn: Hãy vào elevenlabs.io/app/voice-lab ➔ Bấm Add Voice ➔ Tải lên 1 đoạn ghi âm giọng bạn (30s) để có Giọng MC Tiếng Việt siêu mượt nhé!");
      }
    });
  }

  // Clear Audio Cache
  const btnClearAudioCache = document.getElementById('btn-clear-audio-cache');
  if (btnClearAudioCache) {
    btnClearAudioCache.addEventListener('click', async () => {
      if (confirm("⚠️ Bạn có chắc muốn xóa tất cả bộ nhớ đệm âm thanh đã lưu trên máy tính?")) {
        await audioCacheDB.clearAll();
        if (speechEngine.audioCache) speechEngine.audioCache.clear();
        alert("🧹 Đã xóa toàn bộ cache âm thanh! Các câu thoại tiếp theo sẽ được gọi lại API để tạo âm thanh mới.");
      }
    });
  }

  // Audio Cache Manager Modal Handlers
  const btnOpenCacheModal = document.getElementById('btn-open-cache-modal');
  const btnCloseCacheModal = document.getElementById('btn-close-cache-modal');
  const cacheModalBackdrop = document.getElementById('cache-modal-backdrop');
  const cacheItemsList = document.getElementById('cache-items-list');
  const btnClearAllCacheModal = document.getElementById('btn-clear-all-cache-modal');
  let activeCacheAudio = null;

  const knownVoiceNames = {
    '21m00Tcm4TlvDq8ikWAM': 'Rachel (Nữ - Truyền cảm)',
    'EXAVITQu4vr4xnSDxMaL': 'Bella (Nữ - Tươi trẻ)',
    'AZnzlk1XvdvUeBnXmlld': 'Domi (Nữ - Tự tin)',
    'MF3mGyEYCl7XYWbV9V6O': 'Elli (Nữ - Ngọt ngào)',
    'ErXwobaYiN019PkySvjV': 'Antoni (Nam - Trẻ trung)',
    'pNInz6ovD35MwNiWacM7': 'Adam (Nam - Trầm ổn)'
  };

  const renderCacheList = async () => {
    if (!cacheItemsList) return;
    cacheItemsList.innerHTML = `<div style="text-align:center; padding:20px;"><i data-lucide="refresh-cw" class="spin"></i> Đang đọc bộ nhớ cache...</div>`;
    createIcons({ icons });

    const items = await audioCacheDB.getAllKeysAndBlobs();

    if (!items || items.length === 0) {
      cacheItemsList.innerHTML = `
        <div style="text-align:center; padding:32px 16px; color:var(--text-muted);">
          <i data-lucide="inbox" style="width:36px; height:36px; stroke-width:1.5; margin-bottom:8px; opacity:0.6;"></i>
          <p>Chưa có file âm thanh nào được lưu trong bộ nhớ đệm Cache.</p>
          <span style="font-size:11px;">Khi bạn phát giọng ElevenLabs, các câu thoại sẽ tự động xuất hiện ở đây để tái sử dụng 0 Credit.</span>
        </div>
      `;
      createIcons({ icons });
      return;
    }

    cacheItemsList.innerHTML = items.map(item => {
      const parts = item.key.split('_');
      const vId = parts[0] || 'Unknown';
      const mId = parts[1] || 'eleven_multilingual_v2';
      const textSnippet = parts.slice(2).join('_');
      const sizeKB = item.blob ? (item.blob.size / 1024).toFixed(1) : '0';
      const voiceLabel = knownVoiceNames[vId] || `Voice ID: ${vId.slice(0, 10)}...`;

      return `
        <div class="cache-item-card" data-key="${item.key}" data-voice="${vId}" data-model="${mId}">
          <div class="cache-item-header">
            <span class="cache-voice-badge">
              <i data-lucide="mic"></i> 🎤 ${voiceLabel}
            </span>
            <span style="font-size:11px; color:var(--accent-green); font-weight:600;">💾 ${sizeKB} KB (0 Credit)</span>
          </div>
          <div class="cache-item-text">
            "${textSnippet}"
          </div>
          <div class="cache-item-actions">
            <button class="btn btn-xs btn-ghost btn-play-cache-item" title="Nghe thử âm thanh đã lưu">
              <i data-lucide="volume-2"></i> Nghe Thử
            </button>
            <button class="btn btn-xs btn-primary btn-restore-voice-item" title="Đổi ElevenLabs sang dùng lại giọng đọc này">
              <i data-lucide="check-circle"></i> ⚡ Khôi Phục Giọng Này
            </button>
            <button class="btn btn-xs btn-danger btn-delete-cache-item" title="Xóa file này">
              <i data-lucide="trash-2"></i> Xóa
            </button>
          </div>
        </div>
      `;
    }).join('');

    createIcons({ icons });

    // Bind item buttons
    cacheItemsList.querySelectorAll('.cache-item-card').forEach(card => {
      const key = card.dataset.key;
      const vId = card.dataset.voice;

      // Play Preview
      card.querySelector('.btn-play-cache-item').addEventListener('click', async () => {
        if (activeCacheAudio) {
          activeCacheAudio.pause();
          activeCacheAudio = null;
        }
        const blob = await audioCacheDB.getAudioBlob(key);
        if (blob) {
          const url = URL.createObjectURL(blob);
          activeCacheAudio = new Audio(url);
          activeCacheAudio.play();
        }
      });

      // Restore Voice
      card.querySelector('.btn-restore-voice-item').addEventListener('click', () => {
        if (elevenLabsVoiceSelect) {
          const opt = Array.from(elevenLabsVoiceSelect.options).find(o => o.value === vId);
          if (opt) {
            elevenLabsVoiceSelect.value = vId;
            if (customVoiceIdContainer) customVoiceIdContainer.classList.add('hidden');
          } else {
            elevenLabsVoiceSelect.value = 'custom';
            if (customVoiceIdContainer) customVoiceIdContainer.classList.remove('hidden');
            if (elevenLabsVoiceIdInput) elevenLabsVoiceIdInput.value = vId;
          }
        }
        if (chkUseElevenLabs) chkUseElevenLabs.checked = true;
        updateElevenLabsSettings();
        if (cacheModalBackdrop) cacheModalBackdrop.classList.add('hidden');
        alert(`🎉 Đã khôi phục cài đặt sang Giọng đọc: ${knownVoiceNames[vId] || vId}!\n\nCác câu thoại đã từng phát bằng giọng này sẽ tự động chạy 0 Credit.`);
      });

      // Delete Item
      card.querySelector('.btn-delete-cache-item').addEventListener('click', async () => {
        await audioCacheDB.deleteKey(key);
        if (speechEngine.audioCache) speechEngine.audioCache.delete(key);
        card.remove();
        if (cacheItemsList.children.length === 0) {
          renderCacheList();
        }
      });
    });
  };

  if (btnOpenCacheModal && cacheModalBackdrop) {
    btnOpenCacheModal.addEventListener('click', () => {
      cacheModalBackdrop.classList.remove('hidden');
      renderCacheList();
    });
  }

  if (btnCloseCacheModal && cacheModalBackdrop) {
    btnCloseCacheModal.addEventListener('click', () => {
      cacheModalBackdrop.classList.add('hidden');
      if (activeCacheAudio) {
        activeCacheAudio.pause();
        activeCacheAudio = null;
      }
    });
  }

  if (btnClearAllCacheModal) {
    btnClearAllCacheModal.addEventListener('click', async () => {
      if (confirm("⚠️ Bạn có chắc muốn xóa tất cả cache trong máy?")) {
        await audioCacheDB.clearAll();
        if (speechEngine.audioCache) speechEngine.audioCache.clear();
        renderCacheList();
        alert("🧹 Đã xóa toàn bộ cache âm thanh!");
      }
    });
  }

  // Mobile Tab Navigation Switcher Logic
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  const panelMap = {
    'preview-panel': document.querySelector('.preview-panel'),
    'control-panel': document.querySelector('.control-panel'),
    'timeline-panel': document.querySelector('.timeline-panel')
  };

  const updateMobileTabs = (targetId) => {
    mobileTabBtns.forEach(btn => {
      if (btn.dataset.target === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.innerWidth <= 850) {
      Object.keys(panelMap).forEach(id => {
        if (panelMap[id]) {
          if (id === targetId) {
            panelMap[id].classList.remove('mobile-hidden');
          } else {
            panelMap[id].classList.add('mobile-hidden');
          }
        }
      });
    } else {
      // Restore all panels on desktop/laptop
      Object.values(panelMap).forEach(p => p && p.classList.remove('mobile-hidden'));
    }
  };

  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateMobileTabs(btn.dataset.target);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 850) {
      Object.values(panelMap).forEach(p => p && p.classList.remove('mobile-hidden'));
    } else {
      const activeBtn = document.querySelector('.mobile-tab-btn.active');
      if (activeBtn) updateMobileTabs(activeBtn.dataset.target);
    }
  });

  // Perform initial check for mobile screen load
  if (window.innerWidth <= 850) {
    updateMobileTabs('preview-panel');
  }
}

// Studio Password Protection Gate Logic
function initAuthGate() {
  const STUDIO_PASSWORD = 'beanh1510';
  const authOverlay = document.getElementById('auth-lock-overlay');
  const authForm = document.getElementById('auth-form');
  const authPasswordInput = document.getElementById('auth-password-input');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const btnToggleAuthPwd = document.getElementById('btn-toggle-auth-pwd');
  const btnLockStudio = document.getElementById('btn-lock-studio');
  const btnSubmitAuth = document.getElementById('btn-submit-auth');

  if (!authOverlay) return;

  const isAuth = localStorage.getItem('dincox_studio_authenticated') === 'true';

  if (!isAuth) {
    authOverlay.classList.remove('hidden');
    setTimeout(() => authPasswordInput && authPasswordInput.focus(), 300);
  } else {
    authOverlay.classList.add('hidden');
  }

  const checkAndAuthenticate = () => {
    const val = authPasswordInput ? authPasswordInput.value.trim() : '';
    if (val.toLowerCase() === STUDIO_PASSWORD.toLowerCase()) {
      localStorage.setItem('dincox_studio_authenticated', 'true');
      authOverlay.classList.add('hidden');
      if (authErrorMsg) authErrorMsg.classList.add('hidden');
    } else {
      if (authErrorMsg) authErrorMsg.classList.remove('hidden');
      alert("⚠️ Mật khẩu không chính xác! Vui lòng kiểm tra lại.");
      if (authPasswordInput) {
        authPasswordInput.value = '';
        authPasswordInput.focus();
      }
    }
  };

  if (btnSubmitAuth && !btnSubmitAuth._hasAuthListener) {
    btnSubmitAuth._hasAuthListener = true;
    btnSubmitAuth.addEventListener('click', (e) => {
      e.preventDefault();
      checkAndAuthenticate();
    });
  }

  if (authForm && !authForm._hasAuthListener) {
    authForm._hasAuthListener = true;
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      checkAndAuthenticate();
    });
  }

  if (authPasswordInput && !authPasswordInput._hasAuthListener) {
    authPasswordInput._hasAuthListener = true;
    authPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkAndAuthenticate();
      }
    });
  }

  if (btnToggleAuthPwd && authPasswordInput && !btnToggleAuthPwd._hasAuthListener) {
    btnToggleAuthPwd._hasAuthListener = true;
    btnToggleAuthPwd.addEventListener('click', () => {
      const type = authPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      authPasswordInput.setAttribute('type', type);
      btnToggleAuthPwd.innerHTML = type === 'password' ? `<i data-lucide="eye"></i>` : `<i data-lucide="eye-off"></i>`;
      createIcons({ icons });
    });
  }

  if (btnLockStudio && authOverlay && !btnLockStudio._hasAuthListener) {
    btnLockStudio._hasAuthListener = true;
    btnLockStudio.addEventListener('click', () => {
      if (confirm("🔒 Bạn có muốn khóa Studio lại? (Cần nhập lại mật khẩu truy cập để mở lại Studio)")) {
        localStorage.removeItem('dincox_studio_authenticated');
        authOverlay.classList.remove('hidden');
        if (authPasswordInput) {
          authPasswordInput.value = '';
          authPasswordInput.focus();
        }
      }
    });
  }
}

// Initialize Application
function init() {
  initAuthGate();
  createIcons({ icons });
  renderProductList();
  renderPresenterList();
  renderScriptTabs();
  renderTimelineSteps();
  loadCurrentStageText();
  bindEvents();

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
