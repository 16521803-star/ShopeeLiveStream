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
  importAllScriptsJSON,
  exportAllProductsCatalogJSON,
  importAllProductsCatalogJSON,
  restoreProductsCatalogFromLocalStorage
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

// Cross-Tab Broadcast Channel for Real-time Remote Control & OBS Sync
const studioSyncChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('dincox_studio_remote_sync') 
  : null;

// --- Video IndexedDB Cache (shared across all tabs on same origin) ---
// Stores Blob objects by key — much faster than passing base64 through BroadcastChannel
const videoCacheDB = (() => {
  const DB_NAME = 'dincox_video_cache_db';
  const STORE = 'videos';
  let _db = null;
  const _init = () => {
    if (_db) return Promise.resolve(_db);
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        if (!e.target.result.objectStoreNames.contains(STORE))
          e.target.result.createObjectStore(STORE);
      };
      req.onsuccess = e => { _db = e.target.result; res(_db); };
      req.onerror = e => rej(e);
    });
  };
  return {
    async set(key, blob) {
      const db = await _init();
      return new Promise(res => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(blob, key);
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      });
    },
    async get(key) {
      const db = await _init();
      return new Promise(res => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => res(null);
      });
    }
  };
})();

// Helper: save a data-URL as Blob into videoCacheDB
async function saveVideoToCache(key, dataUrl) {
  try {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const byteStr = atob(parts[1]);
    const arr = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    const blob = new Blob([arr], { type: mime });
    await videoCacheDB.set(key, blob);
    return true;
  } catch (e) {
    console.warn('saveVideoToCache failed:', e);
    return false;
  }
}

// Helper: get a Blob URL from IndexedDB cache (returns null if not found)
async function getBlobUrlFromCache(key) {
  const blob = await videoCacheDB.get(key);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

// Helper: load video from IDB into given engine — engine is passed to avoid timing issues
async function loadVideoFromCache(key, engine) {
  const blobUrl = await getBlobUrlFromCache(key);
  if (blobUrl && engine) {
    engine.loadVideoSource(blobUrl);
    return true;
  }
  return false;
}

// Unified helper: resolve the correct default MC video and load it into an engine
// Handles both 'idb:' flag (new) and raw base64/URL (legacy)
async function loadDefaultMcVideo(engine) {
  const flag = localStorage.getItem('dincox_custom_mc_video');
  if (!flag) return false;
  if (flag.startsWith('idb:')) {
    return loadVideoFromCache('default_mc_video', engine);
  } else {
    // Legacy base64 — load directly, also migrate to IDB in background
    engine.loadVideoSource(flag);
    saveVideoToCache('default_mc_video', flag).then(ok => {
      if (ok) localStorage.setItem('dincox_custom_mc_video', 'idb:default_mc_video');
    });
    return true;
  }
}

// Unified helper: resolve reply video and load it
async function loadReplyMcVideo(engine) {
  const flag = localStorage.getItem('dincox_reply_mc_video');
  if (!flag) return false;
  if (flag === 'idb:reply_mc_video') {
    return loadVideoFromCache('reply_mc_video', engine);
  } else {
    engine.loadVideoSource(flag);
    return true;
  }
}

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

// Listen for Remote Control Commands from Main Studio Tab
if (studioSyncChannel) {
  studioSyncChannel.onmessage = (event) => {
    const data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'PLAY_SEQUENCE':
        if (!isSequencePlaying) {
          playScriptSequence(false);
        }
        break;
      case 'STOP_SEQUENCE':
        if (isSequencePlaying) {
          playScriptSequence(false);
        }
        break;
      case 'RELOAD_CATALOG':
        restoreProductsCatalogFromLocalStorage();
        renderProductList();
        break;
      case 'SELECT_PRODUCT':
        if (data.productId) {
          // Always restore catalog from localStorage on OBS tab so product list is up to date
          restoreProductsCatalogFromLocalStorage();

          const isAdvancedObs = !!(data.isAdvanced || localStorage.getItem('dincox_advanced_mode') === 'true');
          const target = DINCOX_PRODUCTS.find(p => p.id === data.productId);
          if (target) {
            activeProduct = target;
            currentScriptStages = generateScriptForProduct(activeProduct);
            activeStageIdx = 0;
            canvasRenderer.setProduct(activeProduct);
            renderProductList();
            renderScriptTabs();
            renderTimelineSteps();
            loadCurrentStageText();
          }

          const videoUrlToUse = (target && target.videoUrl) ? target.videoUrl : data.productVideoUrl;

          if (isAdvancedObs && videoUrlToUse) {
            if (videoUrlToUse.startsWith('idb:')) {
              const key = videoUrlToUse.replace('idb:', '');
              loadVideoFromCache(key, presenterEngine).then(loaded => {
                if (!loaded) {
                  loadDefaultMcVideo(presenterEngine).then(ok => {
                    if (!ok) presenterEngine.setPresenter(activePresenter);
                  });
                }
              });
            } else {
              presenterEngine.loadVideoSource(videoUrlToUse);
            }
          } else {
            loadDefaultMcVideo(presenterEngine).then(ok => {
              if (!ok) presenterEngine.setPresenter(activePresenter);
            });
          }
        }
        break;
      case 'SELECT_PRESENTER':
        if (data.presenterId) {
          const targetP = PRESENTERS.find(p => p.id === data.presenterId);
          if (targetP && (!activePresenter || activePresenter.id !== targetP.id)) {
            selectPresenter(targetP, false);
          }
        }
        break;
      case 'TOGGLE_SETTING':
        if (data.key === 'showFlashSale') {
          canvasRenderer.setShowFlashSaleBanner(data.value);
          const el = document.getElementById('chk-show-flash-sale');
          if (el) el.checked = data.value;
        } else if (data.key === 'showSubtitles') {
          canvasRenderer.setShowSubtitles(data.value);
          const el = document.getElementById('chk-show-subtitles');
          if (el) el.checked = data.value;
        } else if (data.key === 'showProductCard') {
          canvasRenderer.setShowProductCard(data.value);
          const el = document.getElementById('chk-show-product-card');
          if (el) el.checked = data.value;
        } else if (data.key === 'flashSaleTitle') {
          canvasRenderer.setFlashSaleTitle(data.value);
          const el = document.getElementById('flash-sale-title-input');
          if (el) el.value = data.value;
        } else if (data.key === 'advancedMode') {
          const isEnabled = !!data.value;
          document.body.classList.toggle('advanced-mode', isEnabled);
          const el = document.getElementById('chk-advanced-mode');
          if (el) el.checked = isEnabled;
          if (activeProduct) selectProduct(activeProduct, false);
        }
        break;
      case 'UPDATE_SCRIPT_TEXT':
        if (data.productId && data.text !== undefined && currentScriptStages[data.stageIdx]) {
          currentScriptStages[data.stageIdx].text = data.text;
          const inputEl = document.getElementById('script-text-input');
          if (inputEl && activeStageIdx === data.stageIdx) {
            inputEl.value = data.text;
          }
          canvasRenderer.setSpeechState(data.text, currentScriptStages[data.stageIdx].stage);
        }
        break;
      case 'LOAD_CUSTOM_VIDEO':
        if (data.dataUrl) {
          presenterEngine.loadVideoSource(data.dataUrl);
        }
        break;
      case 'RELOAD_DEFAULT_VIDEO':
        // OBS tab reloads default video from shared IndexedDB (no large data transfer)
        loadDefaultMcVideo(presenterEngine).then(ok => {
          if (!ok) presenterEngine.setPresenter(activePresenter);
        });
        break;
      case 'SPEAK_LIVE_REPLY':
        if (data.text) {
          speakLiveReply(data.text, false);
        }
        break;
    }
  };
}

// Animation Loop
let lastTime = 0;
function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  try {
    presenterEngine.update(speechEngine.simulatedVolume);
    canvasRenderer.update(delta);
    canvasRenderer.render(time);
  } catch (err) {
    console.error("Canvas render loop error:", err);
  }

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

  container.innerHTML = DINCOX_PRODUCTS.map((prod, idx) => {
    const hasSale = typeof prod.salePrice === 'number' && !isNaN(prod.salePrice) && prod.salePrice > 0;
    const hasOrig = typeof prod.originalPrice === 'number' && !isNaN(prod.originalPrice) && prod.originalPrice > 0;

    return `
    <div class="product-item-card ${activeProduct && prod.id === activeProduct.id ? 'active' : ''} ${prod.enabled === false ? 'disabled' : ''}" data-id="${prod.id}">
      <input type="checkbox" class="prod-checkbox" data-id="${prod.id}" ${prod.enabled !== false ? 'checked' : ''} title="Bật/Tắt mẫu này khi lặp kịch bản">
      ${prod.image && typeof prod.image === 'string' && prod.image.trim() 
        ? `<img src="${prod.image}" alt="${prod.name}" class="product-thumb">` 
        : `<div class="product-thumb no-img-thumb" style="display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border-radius:8px; font-size:22px;" title="Sản phẩm không hình ảnh">👟</div>`}
      <div class="product-info flex-1">
        <h3>${prod.name}</h3>
        <div class="product-prices">
          ${hasSale ? `<span class="sale-price">${new Intl.NumberFormat('vi-VN').format(prod.salePrice)}đ</span>` : ''}
          ${hasOrig ? `<span class="orig-price">${new Intl.NumberFormat('vi-VN').format(prod.originalPrice)}đ</span>` : ''}
        </div>
      </div>
      <button class="btn-edit-prod" data-id="${prod.id}" title="Chỉnh sửa giá & thông tin">✏️ Sửa</button>
      <div class="prod-reorder-btns">
        <button class="btn-move-prod" data-id="${prod.id}" data-dir="up" ${idx === 0 ? 'disabled' : ''} title="Di chuyển lên">▲</button>
        <button class="btn-move-prod" data-id="${prod.id}" data-dir="down" ${idx === DINCOX_PRODUCTS.length - 1 ? 'disabled' : ''} title="Di chuyển xuống">▼</button>
      </div>
    </div>
  `;
  }).join('');

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

function selectProduct(product, broadcast = true) {
  activeProduct = product;
  currentScriptStages = generateScriptForProduct(activeProduct);
  activeStageIdx = 0;

  // Check Advanced Mode per-product MC video
  const isAdvanced = document.body.classList.contains('advanced-mode') || (localStorage.getItem('dincox_advanced_mode') === 'true');
  if (isAdvanced && activeProduct && activeProduct.videoUrl) {
    if (activeProduct.videoUrl.startsWith('idb:')) {
      const key = activeProduct.videoUrl.replace('idb:', '');
      loadVideoFromCache(key, presenterEngine).then(loaded => {
        if (!loaded) {
          loadDefaultMcVideo(presenterEngine).then(ok => {
            if (!ok) presenterEngine.setPresenter(activePresenter);
          });
        }
      });
    } else {
      presenterEngine.loadVideoSource(activeProduct.videoUrl);
    }
  } else {
    // Load default MC video via unified helper (handles both idb: flag and legacy base64)
    loadDefaultMcVideo(presenterEngine).then(ok => {
      if (!ok) presenterEngine.setPresenter(activePresenter);
    });
  }

  canvasRenderer.setProduct(activeProduct);
  renderProductList();
  renderScriptTabs();
  renderTimelineSteps();
  loadCurrentStageText();

  if (broadcast && studioSyncChannel) {
    const isAdvanced = document.body.classList.contains('advanced-mode') || (localStorage.getItem('dincox_advanced_mode') === 'true');
    // Broadcast product selection and lightweight video reference key
    studioSyncChannel.postMessage({ 
      type: 'SELECT_PRODUCT', 
      productId: product.id,
      hasProductVideo: !!(isAdvanced && product.videoUrl),
      productVideoUrl: (isAdvanced && product.videoUrl) ? product.videoUrl : null,
      isAdvanced: isAdvanced
    });
  }
}

function selectPresenter(presenter, broadcast = true) {
  activePresenter = presenter;
  presenterEngine.setPresenter(activePresenter);
  renderPresenterList();

  if (broadcast && studioSyncChannel) {
    studioSyncChannel.postMessage({ type: 'SELECT_PRESENTER', presenterId: presenter.id });
  }
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
        selectPresenter(found);
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
let currentEditProductVideoUrl = null;
let currentEditProductVideoBlob = null;  // Blob for IndexedDB storage

function openEditModal(productId) {
  const prod = DINCOX_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  currentEditProductVideoUrl = null;
  const fileInput = document.getElementById('edit-prod-video-file');
  if (fileInput) fileInput.value = '';

  document.getElementById('edit-prod-id').value = prod.id;
  document.getElementById('edit-prod-name').value = prod.name;
  document.getElementById('edit-orig-price').value = (prod.originalPrice && !isNaN(prod.originalPrice) && prod.originalPrice > 0) ? prod.originalPrice : '';
  document.getElementById('edit-sale-price').value = (prod.salePrice && !isNaN(prod.salePrice) && prod.salePrice > 0) ? prod.salePrice : '';
  document.getElementById('edit-stock-count').value = prod.stockCount || 10;
  document.getElementById('edit-feature').value = (prod.features && prod.features[0]) ? prod.features[0] : '';

  const statusEl = document.getElementById('edit-prod-video-status');
  if (statusEl) {
    if (prod.videoUrl) {
      statusEl.innerText = '✅ Sản phẩm đã có Video MP4 MC riêng';
      statusEl.style.color = '#10b981';
    } else {
      statusEl.innerText = '⚪ Chưa nạp Video MC riêng (Dùng Video/Avatar mặc định)';
      statusEl.style.color = '#9ca3af';
    }
  }

  document.getElementById('edit-modal-backdrop').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal-backdrop').classList.add('hidden');
}

function saveEditModal() {
  const id = document.getElementById('edit-prod-id').value;
  const name = document.getElementById('edit-prod-name').value;
  const origVal = document.getElementById('edit-orig-price').value.trim();
  const saleVal = document.getElementById('edit-sale-price').value.trim();

  const origParsed = parseInt(origVal, 10);
  const saleParsed = parseInt(saleVal, 10);

  const orig = (!isNaN(origParsed) && origParsed > 0) ? origParsed : 0;
  const sale = (!isNaN(saleParsed) && saleParsed > 0) ? saleParsed : 0;
  const stock = parseInt(document.getElementById('edit-stock-count').value, 10) || 10;
  const feature = document.getElementById('edit-feature').value;

  const updateData = {
    name,
    originalPrice: orig,
    salePrice: sale,
    stockCount: stock,
    features: [feature, 'Công nghệ đế cao su lưu hóa (Vulcanized) chống trượt', 'Bảo hành 12 tháng chính hãng Shopee Mall']
  };

  if (currentEditProductVideoBlob) {
    const prodId = id;
    const key = `product_video_${prodId}`;
    updateData.videoUrl = `idb:${key}`;
    const blobToSave = currentEditProductVideoBlob;
    currentEditProductVideoBlob = null;
    currentEditProductVideoUrl = null;

    videoCacheDB.set(key, blobToSave).then(() => {
      studioSyncChannel?.postMessage({ type: 'RELOAD_CATALOG' });
    });
  } else if (currentEditProductVideoUrl) {
    updateData.videoUrl = currentEditProductVideoUrl;
    currentEditProductVideoUrl = null;
  }

  const updated = updateProductInCatalog(id, updateData);

  if (updated && activeProduct.id === id) {
    selectProduct(updated);
  } else {
    renderProductList();
  }

  closeEditModal();
}

// Default Quick Replies Data
const DEFAULT_QUICK_REPLIES = [
  { id: 'qr_1', label: '👟 Đủ size nha bạn', text: 'Dạ mẫu này bên em đang sẵn đủ size nha bạn ơi, bạn bấm giỏ hàng góc dưới chọn ngay nhé!' },
  { id: 'qr_2', label: '🔥 Mã giảm 50K', text: 'Dạ shop đang áp mã giảm 50K cực xịn trên live, bạn tranh thủ chốt đơn ngay kẻo hết mã ạ!' },
  { id: 'qr_3', label: '🛡️ Bảo hành 12T', text: 'Dạ sản phẩm chính hãng DinCox bảo hành 12 tháng, miễn phí đổi trả nếu không vừa size ạ!' },
  { id: 'qr_4', label: '🛒 Hướng dẫn giỏ hàng', text: 'Dạ bạn bấm vào biểu tượng giỏ hàng góc dưới bên trái màn hình để xem và chọn quà tặng nha!' }
];

function getQuickReplies() {
  try {
    const saved = localStorage.getItem('dincox_quick_replies');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Could not parse saved quick replies", err);
  }
  return DEFAULT_QUICK_REPLIES;
}

function saveQuickReplies(list) {
  try {
    localStorage.setItem('dincox_quick_replies', JSON.stringify(list));
  } catch (err) {
    console.warn("Could not save quick replies to localStorage", err);
  }
}

function renderQuickReplyChips() {
  const container = document.getElementById('quick-chips-container');
  if (!container) return;

  const replies = getQuickReplies();
  container.innerHTML = replies.map(qr => `
    <button type="button" class="btn-quick-chip" data-id="${qr.id}" data-text="${qr.text.replace(/"/g, '&quot;')}">
      ${qr.label}
    </button>
  `).join('');

  container.querySelectorAll('.btn-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.text;
      const liveReplyInput = document.getElementById('live-reply-input');
      if (liveReplyInput) {
        liveReplyInput.value = text;
      }
      speakLiveReply(text);
    });
  });
}

let editingQuickReplies = [];

function openQuickReplyModal() {
  editingQuickReplies = JSON.parse(JSON.stringify(getQuickReplies()));
  renderQuickReplyEditList();
  document.getElementById('quick-reply-modal-backdrop')?.classList.remove('hidden');
}

function closeQuickReplyModal() {
  document.getElementById('quick-reply-modal-backdrop')?.classList.add('hidden');
}

function renderQuickReplyEditList() {
  const listEl = document.getElementById('quick-reply-edit-list');
  if (!listEl) return;

  listEl.innerHTML = editingQuickReplies.map((item, idx) => `
    <div class="qr-edit-card" style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;" data-idx="${idx}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #ff7a45;">Mẫu ${idx + 1}</span>
        ${editingQuickReplies.length > 1 ? `<button type="button" class="btn-remove-qr btn-icon" data-idx="${idx}" style="font-size: 16px; color: #ff4d4f; padding: 0 4px; line-height: 1;" title="Xóa mẫu này">&times;</button>` : ''}
      </div>
      <div class="form-group" style="margin-bottom: 6px;">
        <label style="font-size: 11px; color: var(--text-muted);">Tên nút bấm (Nút hiển thị ngắn)</label>
        <input type="text" class="input-field input-xs qr-edit-label" value="${item.label.replace(/"/g, '&quot;')}" placeholder="Ví dụ: 👟 Đủ size nha bạn">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label style="font-size: 11px; color: var(--text-muted);">Nội dung phát biểu chi tiết của MC AI</label>
        <textarea class="input-field input-xs qr-edit-text" rows="2" placeholder="Nội dung MC sẽ phát khi bấm nút...">${item.text}</textarea>
      </div>
    </div>
  `).join('');

  // Bind remove item buttons
  listEl.querySelectorAll('.btn-remove-qr').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      editingQuickReplies.splice(idx, 1);
      renderQuickReplyEditList();
    });
  });

  // Bind input listeners to update memory array
  listEl.querySelectorAll('.qr-edit-card').forEach(card => {
    const idx = parseInt(card.dataset.idx, 10);
    const labelInput = card.querySelector('.qr-edit-label');
    const textInput = card.querySelector('.qr-edit-text');

    labelInput?.addEventListener('input', (e) => {
      if (editingQuickReplies[idx]) editingQuickReplies[idx].label = e.target.value;
    });

    textInput?.addEventListener('input', (e) => {
      if (editingQuickReplies[idx]) editingQuickReplies[idx].text = e.target.value;
    });
  });
}

// Live Comment Quick Reply Interrupter
let isLiveReplying = false;

function speakLiveReply(replyText, broadcast = true) {
  if (!replyText || typeof replyText !== 'string' || !replyText.trim()) {
    alert("⚠️ Vui lòng nhập nội dung trả lời hoặc chọn một mẫu trả lời nhanh!");
    return;
  }

  const cleanText = replyText.trim();
  const wasSequencePlaying = isSequencePlaying;

  // Interrupt current speech
  speechEngine.stop();
  if (wasSequencePlaying) {
    isSequencePlaying = false;
  }

  isLiveReplying = true;
  canvasRenderer.setSpeechState(cleanText, 'LIVE_REPLY');

  // Advanced Mode: Dedicated Reply Video MP4
  const isAdvanced = document.body.classList.contains('advanced-mode');
  const hasReplyVideo = !!(localStorage.getItem('dincox_reply_mc_video'));
  if (isAdvanced && hasReplyVideo) {
    loadReplyMcVideo(presenterEngine);
  }

  if (broadcast && studioSyncChannel) {
    studioSyncChannel.postMessage({ type: 'SPEAK_LIVE_REPLY', text: cleanText });
  }

  speechEngine.speak(cleanText, {
    pitch: activePresenter.voicePitch,
    rate: activePresenter.voiceRate,
    gender: activePresenter.gender,
    onEnd: () => {
      isLiveReplying = false;

      // Clear input field on completion if present
      const replyInput = document.getElementById('live-reply-input');
      if (replyInput) replyInput.value = '';

      // Advanced Mode: Restore product MC video or default avatar after reply finishes
      if (isAdvanced && hasReplyVideo) {
        if (activeProduct && activeProduct.videoUrl) {
          presenterEngine.loadVideoSource(activeProduct.videoUrl);
        } else {
          loadDefaultMcVideo(presenterEngine).then(ok => {
            if (!ok) presenterEngine.setPresenter(activePresenter);
          });
        }
      }

      // Resume script sequence seamlessly if it was playing before reply
      if (wasSequencePlaying) {
        isSequencePlaying = true;
        const btn = document.getElementById('btn-play-full-sequence');
        if (btn) btn.innerHTML = `<i data-lucide="square"></i> Dừng Kịch Bản`;
        createIcons({ icons });

        // Resume next stage gracefully
        setTimeout(() => playNextStageInSequence(), 800);
      } else {
        // Reset subtitle state if no longer speaking
        canvasRenderer.setSpeechState('', '');
      }
    }
  });
}

// Play script sequence automatically stage by stage
function playScriptSequence(broadcast = true) {
  if (isSequencePlaying) {
    speechEngine.stop();
    isSequencePlaying = false;
    const btn = document.getElementById('btn-play-full-sequence');
    if (btn) btn.innerHTML = `<i data-lucide="play"></i> Phát Kịch Bản Tự Động`;
    createIcons({ icons });
    if (broadcast && studioSyncChannel) {
      studioSyncChannel.postMessage({ type: 'STOP_SEQUENCE' });
    }
    return;
  }

  isSequencePlaying = true;
  const btn = document.getElementById('btn-play-full-sequence');
  if (btn) btn.innerHTML = `<i data-lucide="square"></i> Dừng Kịch Bản`;
  createIcons({ icons });
  if (broadcast && studioSyncChannel) {
    studioSyncChannel.postMessage({ type: 'PLAY_SEQUENCE' });
  }

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
  const chkShowFlashSale = document.getElementById('chk-show-flash-sale');
  const savedShowFlashSale = localStorage.getItem('dincox_show_flash_sale') === 'true'; // Default false (hidden)
  if (chkShowFlashSale) {
    chkShowFlashSale.checked = savedShowFlashSale;
    canvasRenderer.setShowFlashSaleBanner(savedShowFlashSale);

    chkShowFlashSale.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      canvasRenderer.setShowFlashSaleBanner(isChecked);
      localStorage.setItem('dincox_show_flash_sale', isChecked ? 'true' : 'false');
      studioSyncChannel?.postMessage({ type: 'TOGGLE_SETTING', key: 'showFlashSale', value: isChecked });
    });
  }

  const flashSaleTitleInput = document.getElementById('flash-sale-title-input');
  const savedFlashSaleTitle = localStorage.getItem('dincox_flash_sale_title') || '🔥 GIÁ LIVE ƯU ĐÃI';
  if (flashSaleTitleInput) {
    flashSaleTitleInput.value = savedFlashSaleTitle;
    canvasRenderer.setFlashSaleTitle(savedFlashSaleTitle);

    flashSaleTitleInput.addEventListener('input', (e) => {
      const title = e.target.value;
      canvasRenderer.setFlashSaleTitle(title);
      localStorage.setItem('dincox_flash_sale_title', title);
      studioSyncChannel?.postMessage({ type: 'TOGGLE_SETTING', key: 'flashSaleTitle', value: title });
    });
  }

  const chkShowSubtitles = document.getElementById('chk-show-subtitles');
  const savedShowSubtitles = localStorage.getItem('dincox_show_subtitles') === null ? true : (localStorage.getItem('dincox_show_subtitles') === 'true'); // Default true
  if (chkShowSubtitles) {
    chkShowSubtitles.checked = savedShowSubtitles;
    canvasRenderer.setShowSubtitles(savedShowSubtitles);

    chkShowSubtitles.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      canvasRenderer.setShowSubtitles(isChecked);
      localStorage.setItem('dincox_show_subtitles', isChecked ? 'true' : 'false');
      studioSyncChannel?.postMessage({ type: 'TOGGLE_SETTING', key: 'showSubtitles', value: isChecked });
    });
  }

  const chkShowProductCard = document.getElementById('chk-show-product-card');
  const savedShowProductCard = localStorage.getItem('dincox_show_product_card') === null ? true : (localStorage.getItem('dincox_show_product_card') === 'true'); // Default true
  if (chkShowProductCard) {
    chkShowProductCard.checked = savedShowProductCard;
    canvasRenderer.setShowProductCard(savedShowProductCard);

    chkShowProductCard.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      canvasRenderer.setShowProductCard(isChecked);
      localStorage.setItem('dincox_show_product_card', isChecked ? 'true' : 'false');
      studioSyncChannel?.postMessage({ type: 'TOGGLE_SETTING', key: 'showProductCard', value: isChecked });
    });
  }

  // Advanced Studio Mode Toggle Handler
  const chkAdvancedMode = document.getElementById('chk-advanced-mode');
  const savedAdvancedMode = localStorage.getItem('dincox_advanced_mode') === 'true'; // Default false
  if (chkAdvancedMode) {
    chkAdvancedMode.checked = savedAdvancedMode;
    if (savedAdvancedMode) {
      document.body.classList.add('advanced-mode');
    } else {
      document.body.classList.remove('advanced-mode');
    }

    chkAdvancedMode.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.body.classList.toggle('advanced-mode', isChecked);
      localStorage.setItem('dincox_advanced_mode', isChecked ? 'true' : 'false');
      studioSyncChannel?.postMessage({ type: 'TOGGLE_SETTING', key: 'advancedMode', value: isChecked });
      if (activeProduct) {
        selectProduct(activeProduct, false);
      }
    });
  }

  // Dedicated Reply MP4 Video Upload Handler (Advanced Mode)
  const replyVideoInput = document.getElementById('reply-video-file');
  const replyVideoStatus = document.getElementById('reply-video-status');
  if (replyVideoStatus) {
    const savedReplyVideo = localStorage.getItem('dincox_reply_mc_video');
    if (savedReplyVideo) {
      replyVideoStatus.innerText = '✅ Đã nạp Video MP4 MC Trả Lời Riêng';
      replyVideoStatus.style.color = '#10b981';
    } else {
      replyVideoStatus.innerText = '⚪ Chưa nạp video reply riêng (Dùng video/avatar hiện tại)';
      replyVideoStatus.style.color = '#9ca3af';
    }
  }

  replyVideoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read as ArrayBuffer then save Blob to IndexedDB — no size limits like localStorage
      file.arrayBuffer().then(async (buffer) => {
        const blob = new Blob([buffer], { type: file.type });
        await videoCacheDB.set('reply_mc_video', blob);
        // Also try localStorage for backward compat (may fail for large files)
        try {
          const reader = new FileReader();
          reader.onload = evt => localStorage.setItem('dincox_reply_mc_video', 'idb:reply_mc_video');
          reader.readAsDataURL(file);
        } catch (e) {}
        if (replyVideoStatus) {
          replyVideoStatus.innerText = '✅ Đã nạp Video MP4 MC Trả Lời Riêng';
          replyVideoStatus.style.color = '#10b981';
        }
        alert("🎥 Đã nạp thành công Video MP4 MC Trả Lời Riêng cho Chế Độ Nâng Cao!");
      }).catch(err => {
        console.warn('Reply video save failed:', err);
        alert('⚠️ Không thể lưu video. Vui lòng thử lại với file MP4 ngắn hơn.');
      });
    }
  });

  // Per-Product Dedicated MC Video Input Handler in Edit Modal
  const editProdVideoInput = document.getElementById('edit-prod-video-file');
  const editProdVideoStatus = document.getElementById('edit-prod-video-status');
  editProdVideoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store blob directly — productId will be known when user saves the edit modal
      // We keep the data-URL in currentEditProductVideoUrl for backward compat with saveEditModal
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentEditProductVideoUrl = evt.target.result;
        // Also pre-save to IndexedDB using a temp key; saveEditModal will move it to correct key
        currentEditProductVideoBlob = file;
        if (editProdVideoStatus) {
          editProdVideoStatus.innerText = '✅ Đã chọn Video MP4 MC mới cho mẫu này (Bấm "Lưu Thay Đổi" để lưu)';
          editProdVideoStatus.style.color = '#10b981';
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('script-text-input')?.addEventListener('input', (e) => {
    if (currentScriptStages[activeStageIdx]) {
      currentScriptStages[activeStageIdx].text = e.target.value;
      canvasRenderer.setSpeechState(e.target.value, currentScriptStages[activeStageIdx].stage);
      // Auto-save script changes to localStorage immediately
      saveProductScript(activeProduct.id, currentScriptStages);
      studioSyncChannel?.postMessage({ 
        type: 'UPDATE_SCRIPT_TEXT', 
        productId: activeProduct.id, 
        stageIdx: activeStageIdx, 
        text: e.target.value 
      });
    }
  });

  // Live Comment Reply Interrupter Event Bindings
  const btnSendReply = document.getElementById('btn-send-live-reply');
  const liveReplyInput = document.getElementById('live-reply-input');

  btnSendReply?.addEventListener('click', () => {
    const text = liveReplyInput ? liveReplyInput.value : '';
    speakLiveReply(text);
  });

  liveReplyInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = liveReplyInput ? liveReplyInput.value : '';
      speakLiveReply(text);
    }
  });

  // Initial Render of Quick Reply Chips
  renderQuickReplyChips();

  // Quick Reply Manager Modal Listeners
  document.getElementById('btn-open-quick-reply-modal')?.addEventListener('click', openQuickReplyModal);
  document.getElementById('btn-close-quick-reply-modal')?.addEventListener('click', closeQuickReplyModal);
  document.getElementById('btn-cancel-quick-replies')?.addEventListener('click', closeQuickReplyModal);

  document.getElementById('btn-add-quick-reply-item')?.addEventListener('click', () => {
    editingQuickReplies.push({
      id: 'qr_' + Date.now(),
      label: '✨ Mẫu mới',
      text: 'Dạ shop xin chào bạn...'
    });
    renderQuickReplyEditList();
  });

  document.getElementById('btn-save-quick-replies')?.addEventListener('click', () => {
    // Basic validation
    const hasEmpty = editingQuickReplies.some(r => !r.label.trim() || !r.text.trim());
    if (hasEmpty) {
      alert("⚠️ Vui lòng điền đầy đủ Tên nút và Nội dung câu thoại cho tất cả mẫu!");
      return;
    }

    saveQuickReplies(editingQuickReplies);
    renderQuickReplyChips();
    closeQuickReplyModal();
    alert("🎉 Đã lưu thành công các mẫu trả lời nhanh mới!");
  });

  document.getElementById('btn-reset-quick-replies')?.addEventListener('click', () => {
    if (confirm("Khôi phục danh sách mẫu trả lời nhanh về mặc định ban đầu?")) {
      saveQuickReplies(DEFAULT_QUICK_REPLIES);
      renderQuickReplyChips();
      closeQuickReplyModal();
      alert("🧹 Đã khôi phục các mẫu mặc định!");
    }
  });

  // Sidebar Navigation Drawer & Tutorial Modal Event Listeners
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-drawer-backdrop');

  const openSidebar = () => {
    sidebarBackdrop?.classList.remove('hidden');
  };
  const closeSidebar = () => {
    sidebarBackdrop?.classList.add('hidden');
  };

  btnToggleSidebar?.addEventListener('click', openSidebar);
  btnCloseSidebar?.addEventListener('click', closeSidebar);

  sidebarBackdrop?.addEventListener('click', (e) => {
    if (e.target === sidebarBackdrop) closeSidebar();
  });

  // Drawer Tabs Switcher
  document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.drawer-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (targetTab === 'guide') {
        document.getElementById('drawer-tab-guide')?.classList.remove('hidden');
        document.getElementById('drawer-tab-faq')?.classList.add('hidden');
      } else {
        document.getElementById('drawer-tab-faq')?.classList.remove('hidden');
        document.getElementById('drawer-tab-guide')?.classList.add('hidden');
      }
    });
  });

  document.getElementById('btn-quick-lock-drawer')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('btn-lock-studio')?.click();
  });

  document.getElementById('btn-quick-obs-drawer')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('btn-obs-mode')?.click();
  });

  document.getElementById('btn-preview-speech')?.addEventListener('click', () => {
    const text = document.getElementById('script-text-input')?.value || '';
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

  document.getElementById('btn-stop-speech')?.addEventListener('click', () => {
    speechEngine.stop();
  });

  // Export All Scripts to JSON
  document.getElementById('btn-export-script')?.addEventListener('click', () => {
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
  document.getElementById('btn-import-script')?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
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
  document.getElementById('btn-regen-script')?.addEventListener('click', () => {
    if (confirm("Khôi phục kịch bản mặc định cho sản phẩm này? Các chỉnh sửa cá nhân sẽ bị xóa.")) {
      resetProductScript(activeProduct.id);
      currentScriptStages = generateScriptForProduct(activeProduct);
      renderScriptTabs();
      renderTimelineSteps();
      loadCurrentStageText();
    }
  });

  document.getElementById('btn-play-full-sequence')?.addEventListener('click', playScriptSequence);
  document.getElementById('btn-start-record')?.addEventListener('click', toggleVideoRecording);

  document.getElementById('btn-download-video')?.addEventListener('click', () => {
    if (recordedBlob) {
      videoExporter.downloadVideo(recordedBlob, `DinCox_ShopeeLive_${activeProduct.id}.webm`);
    }
  });

  document.getElementById('btn-obs-mode')?.addEventListener('click', () => {
    const obsUrl = `${window.location.origin}${window.location.pathname}?obs=true`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(obsUrl);
    }
    alert(`✅ ĐÃ SAO CHÉP LINK OBS OVERLAY VÀO CLIPBOARD!\n\nLink OBS chuyên dụng:\n${obsUrl}\n\nHướng dẫn kết nối vào OBS:\n1. Mở phần mềm OBS ➔ Ô Sources ➔ Bấm dấu "+" ➔ Chọn "Browser".\n2. Dán đường link trên vào ô URL.\n3. Điền Width: 1080, Height: 1920 ➔ Bấm OK.\n\nHoặc bấm nút "🖥️ Pop-out OBS" để mở cửa sổ riêng và dùng Window Capture trong OBS!`);
  });

  // Pop-out OBS Overlay in a dedicated separate browser window
  let obsPopupWindow = null;
  document.getElementById('btn-obs-popout')?.addEventListener('click', () => {
    const obsUrl = `${window.location.origin}${window.location.pathname}?obs=true`;

    // If popup already open and not closed, just focus it
    if (obsPopupWindow && !obsPopupWindow.closed) {
      obsPopupWindow.focus();
      return;
    }

    // Calculate popup size — 9:16 ratio, half of 1080x1920 = 540x960
    // Position near top-right corner so it doesn't overlap the main studio
    const popW = 540;
    const popH = 960;
    const screenLeft = window.screenLeft ?? window.screenX;
    const screenTop = window.screenTop ?? window.screenY;
    const left = screenLeft + window.outerWidth + 20;
    const top = screenTop;

    obsPopupWindow = window.open(
      obsUrl,
      'DinCox_OBS_Overlay',
      `width=${popW},height=${popH},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    );

    if (!obsPopupWindow) {
      alert('⚠️ Popup bị chặn bởi trình duyệt!\n\nVui lòng bấm "Cho phép popup" ở thanh địa chỉ rồi thử lại.\nHoặc vào Settings > Privacy > Pop-ups and redirects > Thêm site này vào danh sách cho phép.');
      return;
    }

    // Notify user 
    const btn = document.getElementById('btn-obs-popout');
    if (btn) {
      const origHTML = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check-circle"></i> ✅ OBS Đang Mở`;
      btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      createIcons({ icons });

      // Monitor popup close to reset button
      const pollTimer = setInterval(() => {
        if (obsPopupWindow.closed) {
          clearInterval(pollTimer);
          btn.innerHTML = origHTML;
          btn.style.background = 'linear-gradient(135deg, #7c3aed, #a855f7)';
          createIcons({ icons });
          obsPopupWindow = null;
        }
      }, 1000);
    }
  });


  // Custom Product Form Toggle & Tabs
  document.getElementById('toggle-custom-product')?.addEventListener('click', () => {
    document.getElementById('custom-product-form')?.classList.toggle('hidden');
  });

  const tabSingle = document.getElementById('tab-single-prod');
  const tabBatch = document.getElementById('tab-batch-prod');
  const singleContainer = document.getElementById('single-prod-container');
  const batchContainer = document.getElementById('batch-prod-container');

  tabSingle?.addEventListener('click', () => {
    tabSingle.classList.add('active');
    tabBatch?.classList.remove('active');
    singleContainer?.classList.remove('hidden');
    batchContainer?.classList.add('hidden');
  });

  tabBatch?.addEventListener('click', () => {
    tabBatch.classList.add('active');
    tabSingle?.classList.remove('active');
    batchContainer?.classList.remove('hidden');
    singleContainer?.classList.add('hidden');
  });

  // Custom MC Video MP4 Upload Reader
  document.getElementById('mc-video-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      file.arrayBuffer().then(async (buffer) => {
        const blob = new Blob([buffer], { type: file.type });
        // Save to IndexedDB (no size limit, shared across tabs)
        await videoCacheDB.set('default_mc_video', blob);
        // Create blob URL for immediate local playback
        const blobUrl = URL.createObjectURL(blob);
        presenterEngine.loadVideoSource(blobUrl);
        // Mark in localStorage that IDB has the video (lightweight flag)
        localStorage.setItem('dincox_custom_mc_video', 'idb:default_mc_video');
        // Notify OBS tab to reload from IDB (no data transfer)
        studioSyncChannel?.postMessage({ type: 'RELOAD_DEFAULT_VIDEO' });
        alert("🎥 Đã nạp thành công Video MP4 MC Người Thật! Video sẽ tự động lặp trên khung Shopee Live 9:16 và đồng bộ trực tiếp sang OBS.");
      }).catch(err => {
        console.warn('MC video save failed:', err);
        alert('⚠️ Không thể lưu video. Vui lòng thử lại.');
      });
    }
  });
  document.getElementById('cust-img-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        customUploadedImageDataUrl = evt.target.result;
        const previewBox = document.getElementById('cust-img-preview');
        if (previewBox) {
          previewBox.innerHTML = `<img src="${customUploadedImageDataUrl}" alt="Preview">`;
          previewBox.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // 1-Click Shopee Official Store Importer
  document.getElementById('btn-import-shopee')?.addEventListener('click', () => {
    const count = importShopeeOfficialCatalog();
    renderProductList();
    if (DINCOX_PRODUCTS.length > 0) {
      selectProduct(DINCOX_PRODUCTS[DINCOX_PRODUCTS.length - 1]);
    }
    alert(`⚡ Đã import thành công ${count} sản phẩm mới từ Shopee Mall DinCox Official Store!`);
  });

  // 1-Click dincox.com Web Importer
  document.getElementById('btn-import-web')?.addEventListener('click', () => {
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
  document.getElementById('btn-apply-custom')?.addEventListener('click', () => {
    const name = document.getElementById('cust-name')?.value || 'Giày DinCox Mới';
    const orig = parseInt(document.getElementById('cust-orig-price')?.value, 10) || 750000;
    const sale = parseInt(document.getElementById('cust-sale-price')?.value, 10) || 450000;
    const feat = document.getElementById('cust-feature')?.value || 'Lót Latex Memory Foam siêu êm';

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
      image: customUploadedImageDataUrl || './assets/dincox_dc47.png',
      stockCount: 10,
      features: [feat, 'Công nghệ đế cao su lưu hóa (Vulcanized) 100% bám đường', 'Bảo hành 12 tháng chính hãng Shopee Mall']
    };

    addProductToCatalog(customProd);
    renderProductList();
    selectProduct(customProd);

    // Reset inputs
    if (document.getElementById('cust-name')) document.getElementById('cust-name').value = '';
    if (document.getElementById('cust-orig-price')) document.getElementById('cust-orig-price').value = '';
    if (document.getElementById('cust-sale-price')) document.getElementById('cust-sale-price').value = '';
    if (document.getElementById('cust-feature')) document.getElementById('cust-feature').value = '';
    if (document.getElementById('cust-img-file')) document.getElementById('cust-img-file').value = '';
    document.getElementById('cust-img-preview')?.classList.add('hidden');
    customUploadedImageDataUrl = null;
  });

  // Batch List Importer
  document.getElementById('btn-apply-batch')?.addEventListener('click', () => {
    const rawText = document.getElementById('batch-text-input')?.value || '';
    const parsed = parseBatchProductsList(rawText);
    if (parsed.length > 0) {
      renderProductList();
      selectProduct(parsed[0]);
      alert(`🎉 Đã import thành công danh sách ${parsed.length} mẫu giày mới vào hệ thống!`);
      if (document.getElementById('batch-text-input')) document.getElementById('batch-text-input').value = '';
    } else {
      alert("Vui lòng nhập đúng định dạng: Tên Giày | Giá Gốc | Giá Live | Tính Năng");
    }
  });

  // Edit Modal Controls
  document.getElementById('btn-close-modal')?.addEventListener('click', closeEditModal);
  document.getElementById('btn-save-edit-prod')?.addEventListener('click', saveEditModal);
  document.getElementById('edit-prod-video-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      currentEditProductVideoBlob = file;
      currentEditProductVideoUrl = `idb:product_video_${document.getElementById('edit-prod-id')?.value}`;
      const statusEl = document.getElementById('edit-prod-video-status');
      if (statusEl) {
        statusEl.innerText = `✅ Đã chọn tệp: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB). Bấm "Lưu Thay Đổi" để nạp!`;
        statusEl.style.color = '#ff7a45';
      }
    }
  });

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
  // Force ElevenLabs to OFF (false) on page load to protect user credits
  localStorage.setItem('dincox_elevenlabs_enabled', 'false');
  const savedElevenEnabled = false;
  const savedElevenConfirmVal = localStorage.getItem('dincox_elevenlabs_confirm');
  const savedElevenConfirm = savedElevenConfirmVal === null ? true : (savedElevenConfirmVal === 'true');

  if (savedElevenKey && elevenLabsApiKeyInput) elevenLabsApiKeyInput.value = savedElevenKey;
  if (savedElevenModel && elevenLabsModelSelect) elevenLabsModelSelect.value = savedElevenModel;
  if (chkUseElevenLabs) chkUseElevenLabs.checked = false;
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

// OBS Side Remote Control Dock & Global Keyboard Shortcuts System
function renderObsRemoteUI() {
  const container = document.getElementById('obs-remote-prod-list');
  if (container) {
    container.innerHTML = DINCOX_PRODUCTS.map((prod, idx) => {
      const isActive = activeProduct && activeProduct.id === prod.id;
      const formattedSale = (prod.salePrice && prod.salePrice > 0) ? (prod.salePrice / 1000) + 'k' : '';
      return `
        <div class="remote-prod-item ${isActive ? 'active' : ''}" data-id="${prod.id}" data-idx="${idx}">
          <span style="display: flex; gap: 6px; align-items: center;">
            <strong style="color: #ff7a45; font-size: 10px;">[${idx + 1}]</strong>
            <span style="max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${prod.name}</span>
          </span>
          <span style="font-weight: 700; color: #10b981;">${formattedSale}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.remote-prod-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        if (!isNaN(idx) && DINCOX_PRODUCTS[idx]) {
          selectProduct(DINCOX_PRODUCTS[idx]);
          renderObsRemoteUI();
        }
      });
    });

    // Auto-scroll to active product element so 10+ items are kept visible
    setTimeout(() => {
      const activeItem = container.querySelector('.remote-prod-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 50);
  }

  const quickContainer = document.getElementById('obs-remote-quick-list');
  if (quickContainer) {
    const replies = getQuickReplies();
    quickContainer.innerHTML = replies.slice(0, 4).map((qr, idx) => `
      <button type="button" class="remote-quick-chip" data-text="${qr.text.replace(/"/g, '&quot;')}">
        <strong style="color: #34d399; font-size: 10px;">[F${idx + 1}]</strong> ${qr.label}
      </button>
    `).join('');

    quickContainer.querySelectorAll('.remote-quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.text;
        speakLiveReply(text);
      });
    });
  }

  const lblPlay = document.getElementById('lbl-obs-play');
  if (lblPlay) {
    lblPlay.innerText = isSequencePlaying ? 'Tạm Dừng Kịch Bản' : 'Phát Kịch Bản';
  }
}

function toggleObsSideRemote(show) {
  const remote = document.getElementById('obs-side-remote');
  const pill = document.getElementById('btn-show-obs-remote-pill');
  if (!remote) return;

  const isCurrentlyHidden = remote.classList.contains('hidden');
  const shouldHide = show !== undefined ? !show : !isCurrentlyHidden;

  if (shouldHide) {
    remote.classList.add('hidden');
    pill?.classList.remove('hidden');
  } else {
    remote.classList.remove('hidden');
    pill?.classList.add('hidden');
    renderObsRemoteUI();
  }
}

function switchProductByOffset(offset) {
  if (!DINCOX_PRODUCTS || DINCOX_PRODUCTS.length === 0) return;
  let currentIdx = DINCOX_PRODUCTS.findIndex(p => p.id === activeProduct?.id);
  if (currentIdx === -1) currentIdx = 0;
  let newIdx = currentIdx + offset;
  if (newIdx < 0) newIdx = DINCOX_PRODUCTS.length - 1;
  if (newIdx >= DINCOX_PRODUCTS.length) newIdx = 0;
  selectProduct(DINCOX_PRODUCTS[newIdx]);
  renderObsRemoteUI();
}

function initObsSideRemote() {
  const btnToggle = document.getElementById('btn-toggle-obs-remote');
  const btnPill = document.getElementById('btn-show-obs-remote-pill');
  const btnPlay = document.getElementById('btn-obs-play-toggle');
  const btnPrev = document.getElementById('btn-obs-prev-prod');
  const btnNext = document.getElementById('btn-obs-next-prod');

  btnToggle?.addEventListener('click', () => toggleObsSideRemote(false));
  btnPill?.addEventListener('click', () => toggleObsSideRemote(true));
  btnPlay?.addEventListener('click', () => {
    playScriptSequence();
    renderObsRemoteUI();
  });
  btnPrev?.addEventListener('click', () => switchProductByOffset(-1));
  btnNext?.addEventListener('click', () => switchProductByOffset(1));

  // Custom Live Reply Handler inside OBS Side Remote Dock
  const customInput = document.getElementById('obs-remote-custom-input');
  const btnSendCustom = document.getElementById('btn-obs-remote-send-custom');

  const handleSendCustomReply = () => {
    if (!customInput) return;
    const text = customInput.value.trim();
    if (text) {
      speakLiveReply(text);
      customInput.value = '';
      customInput.blur();
    }
  };

  btnSendCustom?.addEventListener('click', handleSendCustomReply);
  customInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendCustomReply();
    }
  });

  // Default: Show side remote panel on OBS tab
  toggleObsSideRemote(true);

  // Multi-digit number keypress buffer (e.g. typing "10" or "14" within 450ms)
  let digitBuffer = '';
  let digitTimer = null;

  const handleDigitInput = (digitChar) => {
    digitBuffer += digitChar;
    if (digitTimer) clearTimeout(digitTimer);
    digitTimer = setTimeout(() => {
      const num = parseInt(digitBuffer, 10);
      digitBuffer = '';
      if (!isNaN(num) && num >= 1 && num <= DINCOX_PRODUCTS.length) {
        const targetProd = DINCOX_PRODUCTS[num - 1];
        if (targetProd) {
          selectProduct(targetProd);
          renderObsRemoteUI();
        }
      }
    }, 450);
  };

  // Bind Global Keyboard Shortcuts (Space, Arrows, 0-9, F1-F4, H)
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    const key = e.key;

    if (key === 'h' || key === 'H') {
      e.preventDefault();
      toggleObsSideRemote();
      return;
    }

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      playScriptSequence();
      renderObsRemoteUI();
      return;
    }

    if (key === 'ArrowDown' || key === 'PageDown') {
      e.preventDefault();
      switchProductByOffset(1);
      return;
    }

    if (key === 'ArrowUp' || key === 'PageUp') {
      e.preventDefault();
      switchProductByOffset(-1);
      return;
    }

    // Number keys 0-9 (Supports typing 1-digit or 2-digit product numbers like 1, 10, 14)
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      handleDigitInput(key);
      return;
    }

    if (key.startsWith('F') && key.length >= 2) {
      const num = parseInt(key.slice(1), 10);
      if (num >= 1 && num <= 4) {
        const replies = getQuickReplies();
        if (replies[num - 1]) {
          e.preventDefault();
          speakLiveReply(replies[num - 1].text);
        }
      }
    }
  });
}

// Initialize Application
function init() {
  const isObsMode = window.location.search.includes('obs=true') || window.location.search.includes('overlay=true');
  if (isObsMode) {
    document.body.classList.add('obs-mode');
    document.getElementById('auth-lock-overlay')?.classList.add('hidden');
    initObsSideRemote();
  } else {
    initAuthGate();
  }

  const savedAdvancedMode = localStorage.getItem('dincox_advanced_mode') === 'true';
  if (savedAdvancedMode) {
    document.body.classList.add('advanced-mode');
  }

  // Load default MC video using unified helper — handles idb: flag and legacy base64
  // selectProduct below will also call this, but calling here ensures video preloads ASAP on OBS tab
  loadDefaultMcVideo(presenterEngine);

  createIcons({ icons });
  renderProductList();
  renderPresenterList();
  renderScriptTabs();
  renderTimelineSteps();
  loadCurrentStageText();
  bindEvents();

  if (activeProduct) {
    selectProduct(activeProduct, false);
  }

  requestAnimationFrame(animate);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
