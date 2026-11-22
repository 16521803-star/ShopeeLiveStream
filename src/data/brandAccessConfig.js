// Brand Access & SHA-256 Authentication Configuration
// Web: Shopee Live Studio & AI Streamer Generator

// Web Crypto SHA-256 Hashing Helper (Native browser, zero dependencies)
export async function sha256(plainText) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this environment');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Master Admin Password Hash (Password: "beanh2211")
// Master password can unlock any brand name at any time.
export const MASTER_PASSWORD_HASH = 'fb4b9d161b614c8f4210dbcc4e1c9c0ed00a0150382cbab0056d0168cf63b0aa';

// TikTok Master Admin Password Hash (Password: "beanh2211tiktok")
// Only activates TikTok LIVE AI layout when this password is used.
export const TIKTOK_MASTER_PASSWORD_HASH = 'c48a36d397bf5cbf73db05c7d665ad51489f6ea690ae526329e467d839fef898';

// Internal cryptographic salt for signing sub-brand JSON catalogs (7-day expiry)
const CATALOG_SIGNING_SALT = 'DinCox_Signed_Catalog_2026_Secret_Key_#9821';

/**
 * Danh sách các Thương Hiệu (Brands) được cấp phép sử dụng Studio.
 * Khi cần cấp quyền cho 1 Brand mới:
 * 1. Chạy `generateBrandHash("mật_khẩu_của_họ")` trên F12 Console để lấy mã hash SHA-256.
 * 2. Thêm 1 dòng vào danh sách bên dưới rồi commit & push.
 */
export const AUTHORIZED_BRANDS = {
  // Brand 1: DinCox Shoes (Mặc định) - Mật khẩu: beanh2211
  "dincox": {
    name: "DinCox",
    hash: "fb4b9d161b614c8f4210dbcc4e1c9c0ed00a0150382cbab0056d0168cf63b0aa",
    subtitle: "Giày Chuẩn EU - Giá Ưu Việt"
  },

  // Brand 2: Dincox2 (Brand phụ DinCox) - Mật khẩu: Nhatanhlee1510
  "dincox2": {
    name: "Dincox2",
    // SHA-256 of "Nhatanhlee1510"
    hash: "40266b22c44486716e2b8beea2fab6d4fc58d95adbea035c3c23d4545ccd50c9",
    subtitle: "Live AI của Dincox",
    watermarkText: "Live AI của Dincox"
  },

  // Brand 3: Demo Partner Brand (Mẫu thử nghiệm) - Mật khẩu: demo@2026
  "demo": {
    name: "Demo Partner",
    // SHA-256 of "demo@2026"
    hash: "86de5f44e1328ebcc47bb5f661a3511eb9c98ef2e5b8d234a49c25f05b0b2302",
    subtitle: "Official Shopee Live Partner"
  }
};

/**
 * Kiểm tra xác thực Thương hiệu & Mật khẩu
 * @param {string} brandName Tên thương hiệu
 * @param {string} password Mật khẩu
 * @returns {Promise<{success: boolean, brand?: string, sessionToken?: string, subtitle?: string, message?: string}>}
 */
export async function verifyBrandAccess(brandName, password) {
  if (!password || !password.trim()) {
    return { success: false, message: "⚠️ Vui lòng nhập mật khẩu truy cập!" };
  }

  const passTrimmed = password.trim();
  const inputHash = await sha256(passTrimmed);

  // 1. Kiểm tra quyền TikTok Master Admin ("beanh2211tiktok") -> Kích hoạt layout TikTok LIVE AI
  if (inputHash === TIKTOK_MASTER_PASSWORD_HASH) {
    const finalBrand = (brandName && brandName.trim()) ? brandName.trim() : 'DinCox';
    const sessionToken = await sha256(`tiktok:${finalBrand.toLowerCase()}:${inputHash}`);
    return {
      success: true,
      brand: finalBrand,
      sessionToken,
      isAdmin: true,
      platformMode: 'tiktok',
      subtitle: `${finalBrand} • TikTok LIVE AI Studio`
    };
  }

  // 2. Kiểm tra quyền Shopee Master Admin ("beanh2211") -> Giữ nguyên layout Shopee hiện tại
  if (inputHash === MASTER_PASSWORD_HASH) {
    const finalBrand = (brandName && brandName.trim()) ? brandName.trim() : 'DinCox';
    const sessionToken = await sha256(`admin:${finalBrand.toLowerCase()}:${inputHash}`);
    return { 
      success: true, 
      brand: finalBrand, 
      sessionToken, 
      isAdmin: true,
      platformMode: 'shopee',
      subtitle: finalBrand.toLowerCase() === 'dincox' ? 'Giày Chuẩn EU - Giá Ưu Việt' : (finalBrand.toLowerCase() === 'dincox2' ? 'Live AI của Dincox' : `${finalBrand} • Official Live Stream`)
    };
  }

  // 2. Kiểm tra theo từng Brand cụ thể
  const brandKey = (brandName || '').trim().toLowerCase();
  if (!brandKey) {
    return { success: false, message: "⚠️ Vui lòng nhập Tên Thương Hiệu của bạn!" };
  }

  const brandConfig = AUTHORIZED_BRANDS[brandKey];
  if (!brandConfig) {
    return { 
      success: false, 
      message: `⚠️ Thương hiệu "${brandName}" chưa được cấp quyền sử dụng Studio. Vui lòng liên hệ Quản trị viên!` 
    };
  }

  if (inputHash !== brandConfig.hash) {
    return { success: false, message: "⚠️ Mật khẩu thương hiệu không chính xác! Vui lòng thử lại." };
  }

  // Khớp mật khẩu của Brand
  const sessionToken = await sha256(`brand:${brandKey}:${inputHash}`);
  return { 
    success: true, 
    brand: brandConfig.name, 
    sessionToken, 
    subtitle: brandConfig.subtitle || `${brandConfig.name} • Official Live Stream`,
    isAdmin: false 
  };
}

/**
 * Kiểm tra xem phiên đăng nhập hiện tại có hợp lệ không.
 * Sử dụng sessionStorage để bắt buộc nhập lại mật khẩu cho mỗi phiên tắt/bật lại trình duyệt.
 */
export async function validateStoredSession() {
  try {
    // Dọn dẹp token cũ trong localStorage nếu có (chuyển đổi từ persistent sang session-only)
    if (localStorage.getItem('dincox_studio_auth_token') || localStorage.getItem('dincox_studio_authenticated')) {
      localStorage.removeItem('dincox_studio_auth_token');
      localStorage.removeItem('dincox_studio_authenticated');
    }

    const storedToken = sessionStorage.getItem('dincox_studio_auth_token');
    const storedBrand = localStorage.getItem('dincox_studio_branch') || 'DinCox';
    const sessionAuth = sessionStorage.getItem('dincox_studio_authenticated');

    if (!storedToken && sessionAuth !== 'true') {
      return false;
    }

    // Nếu đã có token, verify token khớp với master, tiktok master hoặc brand
    if (storedToken) {
      const brandKey = storedBrand.trim().toLowerCase();
      const expectedAdminToken = await sha256(`admin:${brandKey}:${MASTER_PASSWORD_HASH}`);
      if (storedToken === expectedAdminToken) return true;

      const expectedTiktokToken = await sha256(`tiktok:${brandKey}:${TIKTOK_MASTER_PASSWORD_HASH}`);
      if (storedToken === expectedTiktokToken) return true;

      const brandConfig = AUTHORIZED_BRANDS[brandKey];
      if (brandConfig) {
        const expectedBrandToken = await sha256(`brand:${brandKey}:${brandConfig.hash}`);
        if (storedToken === expectedBrandToken) return true;
      }
    }

    if (sessionAuth === 'true') {
      return true;
    }

    return false;
  } catch (e) {
    console.warn("Session validation error:", e);
    return false;
  }
}

/**
 * Kiểm tra phiên hiện tại có phải Master Admin (hoặc Master Brand "DinCox") hay không.
 * Brand phụ (như Dincox2, demo...) đăng nhập bằng mật khẩu phụ sẽ trả về false.
 */
export async function isCurrentSessionAdmin() {
  try {
    const storedBrand = (localStorage.getItem('dincox_studio_branch') || 'DinCox').trim().toLowerCase();
    const storedToken = sessionStorage.getItem('dincox_studio_auth_token');
    if (!storedToken) {
      return storedBrand === 'dincox' && sessionStorage.getItem('dincox_studio_authenticated') === 'true';
    }
    const expectedAdminToken = await sha256(`admin:${storedBrand}:${MASTER_PASSWORD_HASH}`);
    if (storedToken === expectedAdminToken) return true;
    const expectedTiktokToken = await sha256(`tiktok:${storedBrand}:${TIKTOK_MASTER_PASSWORD_HASH}`);
    if (storedToken === expectedTiktokToken) return true;
    if (storedBrand === 'dincox') {
      const expectedDincoxToken = await sha256(`brand:dincox:${MASTER_PASSWORD_HASH}`);
      if (storedToken === expectedDincoxToken) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Kiểm tra phiên hiện tại có đang ở chế độ TikTok LIVE AI (đăng nhập bằng mật khẩu TikTok Master) hay không.
 */
export async function isCurrentSessionTiktokMode() {
  try {
    const storedBrand = (localStorage.getItem('dincox_studio_branch') || 'DinCox').trim().toLowerCase();
    const storedToken = sessionStorage.getItem('dincox_studio_auth_token');
    if (!storedToken) return false;
    const expectedTiktokToken = await sha256(`tiktok:${storedBrand}:${TIKTOK_MASTER_PASSWORD_HASH}`);
    return storedToken === expectedTiktokToken;
  } catch (e) {
    return false;
  }
}

/**
 * Tạo payload chữ ký chuẩn cho danh sách sản phẩm
 */
function buildCatalogSignaturePayload(brandKey, issuedAt, expiresAt, products) {
  return JSON.stringify({
    brand: brandKey,
    issuedAt,
    expiresAt,
    products
  }) + '::' + CATALOG_SIGNING_SALT;
}

/**
 * Ký số tệp JSON sản phẩm cho Brand phụ với thời hạn mặc định 7 ngày.
 */
export async function signCatalogProductsForBrand(products, targetBrand, expireDays = 7) {
  const brandClean = (targetBrand || '').trim() || 'Dincox2';
  const brandKey = brandClean.toLowerCase();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + expireDays * 24 * 60 * 60 * 1000;
  const payload = buildCatalogSignaturePayload(brandKey, issuedAt, expiresAt, products);
  const signature = await sha256(payload);

  return {
    format: 'dincox-signed-catalog-v1',
    brand: brandClean,
    issuedAt,
    expiresAt,
    expiresAtISO: new Date(expiresAt).toISOString(),
    signature,
    products
  };
}

/**
 * Xác thực tệp JSON có chữ ký số dành cho Brand phụ (kiểm tra đúng brand, chưa hết hạn 7 ngày, chưa bị chỉnh sửa).
 */
export async function verifySignedCatalogJSON(jsonStr, currentBrand) {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { valid: false, message: '⚠️ Tệp JSON không hợp lệ hoặc bị lỗi cú pháp!' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.format !== 'dincox-signed-catalog-v1') {
    return {
      valid: false,
      message: '🔒 Tệp JSON này chưa được ký xác thực bởi Admin DinCox!\n\nBrand phụ chỉ được phép nạp tệp JSON đã ký bảo mật (có chữ ký số & hạn sử dụng 7 ngày) do Admin cấp.'
    };
  }

  if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
    return { valid: false, message: '⚠️ Tệp JSON không chứa danh sách sản phẩm hợp lệ!' };
  }

  const fileBrandKey = String(parsed.brand || '').trim().toLowerCase();
  const activeBrandKey = String(currentBrand || '').trim().toLowerCase();
  if (!fileBrandKey || (fileBrandKey !== '*' && fileBrandKey !== activeBrandKey)) {
    return {
      valid: false,
      message: `🔒 Tệp JSON này được cấp riêng cho thương hiệu "${parsed.brand || 'Không xác định'}", không thể nạp vào "${currentBrand}"!`
    };
  }

  if (!parsed.expiresAt || typeof parsed.expiresAt !== 'number' || Date.now() > parsed.expiresAt) {
    const expiredDate = parsed.expiresAt ? new Date(parsed.expiresAt).toLocaleString('vi-VN') : 'Không rõ';
    return {
      valid: false,
      message: `⏰ Tệp JSON sản phẩm này đã HẾT HẠN sử dụng (hết hạn lúc: ${expiredDate})!\n\nMỗi kịch bản/danh sách xuất cho Brand phụ chỉ có hiệu lực 7 ngày. Vui lòng liên hệ Admin để xuất tệp mới.`
    };
  }

  const expectedPayload = buildCatalogSignaturePayload(fileBrandKey, parsed.issuedAt, parsed.expiresAt, parsed.products);
  const expectedSignature = await sha256(expectedPayload);
  if (parsed.signature !== expectedSignature) {
    return {
      valid: false,
      message: '❌ Chữ ký bảo mật của tệp JSON không hợp lệ hoặc nội dung sản phẩm đã bị chỉnh sửa trái phép!'
    };
  }

  return { valid: true, parsed };
}

/**
 * Kiểm tra xem Brand phụ hiện tại có phải áp dụng rule kiểm tra chữ ký số JSON hay không.
 * Riêng Brand "Dincox2": tạm thời KHÔNG check chữ ký vào các ngày thường,
 * chỉ check vào các ngày theo chu kỳ +7 ngày tính từ mốc 20/11/2026 (27/11, 04/12, 11/12, 18/12...).
 */
export function shouldEnforceSignatureForBrand(brandName, nowDate = new Date()) {
  const brandKey = String(brandName || '').trim().toLowerCase();
  if (brandKey === 'dincox2') {
    let y;
    let m;
    let d;
    try {
      const vnDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(nowDate);
      [y, m, d] = vnDateStr.split('-').map(Number);
    } catch (e) {
      y = nowDate.getFullYear();
      m = nowDate.getMonth() + 1;
      d = nowDate.getDate();
    }
    const todayUTC = Date.UTC(y, m - 1, d);
    const anchorUTC = Date.UTC(2026, 10, 20); // 20/11/2026 (month 10 = Nov)
    const diffDays = Math.round((todayUTC - anchorUTC) / 86400000);
    return diffDays >= 7 && diffDays % 7 === 0;
  }
  return true;
}

/**
 * Tiện ích tạo mã SHA-256 cho mật khẩu mới (dành cho Admin trên F12 Console)
 */
export async function generateBrandHash(plainPassword) {
  if (!plainPassword) return '';
  const hash = await sha256(plainPassword.trim());
  console.log(`%c🔑 SHA-256 Hash for "${plainPassword}":`, 'color: #ff7a45; font-weight: bold; font-size: 14px;');
  console.log(`%c${hash}`, 'color: #10b981; font-weight: bold; font-size: 14px; background: #0f172a; padding: 4px 8px; border-radius: 4px;');
  return hash;
}

// Expose helper to window for convenience in browser DevTools
if (typeof window !== 'undefined') {
  window.generateBrandHash = generateBrandHash;
}
