import { createIcons, icons } from 'lucide';
import { 
  DINCOX_PRODUCTS, 
  PRESENTERS, 
  generateScriptForProduct, 
  addProductToCatalog, 
  updateProductInCatalog,
  toggleProductEnabled,
  importShopeeOfficialCatalog, 
  importWebDincoxCatalog,
  parseBatchProductsList 
} from './data/dincoxCatalog.js';
import { speechEngine } from './engine/speechSynthesizer.js';
import { AIPresenterEngine } from './engine/aiPresenterEngine.js';
import { ShopeeCanvasRenderer } from './engine/canvasRenderer.js';
import { VideoExporter } from './engine/videoExporter.js';

// Application State
let activeProduct = DINCOX_PRODUCTS[0];
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

canvasRenderer.setPresenterEngine(presenterEngine);
canvasRenderer.setProduct(activeProduct);

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
  container.innerHTML = DINCOX_PRODUCTS.map(prod => `
    <div class="product-item-card ${prod.id === activeProduct.id ? 'active' : ''} ${prod.enabled === false ? 'disabled' : ''}" data-id="${prod.id}">
      <input type="checkbox" class="prod-checkbox" data-id="${prod.id}" ${prod.enabled !== false ? 'checked' : ''} title="Bật/Tắt mẫu này khi lặp kịch bản">
      <img src="${prod.image}" alt="${prod.name}" class="product-thumb">
      <div class="product-info flex-1">
        <h3>${prod.name}</h3>
        <div class="product-prices">
          <span class="sale-price">${new Intl.NumberFormat('vi-VN').format(prod.salePrice)}đ</span>
          <span class="orig-price">${new Intl.NumberFormat('vi-VN').format(prod.originalPrice)}đ</span>
        </div>
      </div>
      <button class="btn-edit-prod" data-id="${prod.id}" title="Chỉnh sửa giá & thông tin">✏️ Sửa</button>
    </div>
  `).join('');

  // Select Product click
  container.querySelectorAll('.product-item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('prod-checkbox') || e.target.classList.contains('btn-edit-prod')) return;
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
      // Loop to next enabled product in catalog
      const currentProdIdx = enabledProducts.findIndex(p => p.id === activeProduct.id);
      const nextProdIdx = (currentProdIdx + 1) % enabledProducts.length;
      selectProduct(enabledProducts[nextProdIdx]);
      activeStageIdx = 0;
      setTimeout(() => playNextStageInSequence(), 1000);
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
    }
  });

  document.getElementById('btn-preview-speech').addEventListener('click', () => {
    const text = document.getElementById('script-text-input').value;
    speechEngine.speak(text, {
      pitch: activePresenter.voicePitch,
      rate: activePresenter.voiceRate,
      gender: activePresenter.gender
    });
  });

  document.getElementById('btn-stop-speech').addEventListener('click', () => {
    speechEngine.stop();
  });

  document.getElementById('btn-regen-script').addEventListener('click', () => {
    currentScriptStages = generateScriptForProduct(activeProduct);
    renderScriptTabs();
    renderTimelineSteps();
    loadCurrentStageText();
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
}

// Initialize Application
function init() {
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
