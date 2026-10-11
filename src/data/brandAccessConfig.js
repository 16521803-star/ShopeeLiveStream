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

// Master Admin Password Hash (Password: "beanh1510")
// Master password can unlock any brand name at any time.
export const MASTER_PASSWORD_HASH = 'a518306ed5529f68af96b34ec3bc784301413dedcd8c33e632c96155a1f88d4c';

/**
 * Danh sách các Thương Hiệu (Brands) được cấp phép sử dụng Studio.
 * Khi cần cấp quyền cho 1 Brand mới:
 * 1. Chạy `generateBrandHash("mật_khẩu_của_họ")` trên F12 Console để lấy mã hash SHA-256.
 * 2. Thêm 1 dòng vào danh sách bên dưới rồi commit & push.
 */
export const AUTHORIZED_BRANDS = {
  // Brand 1: DinCox Shoes (Mặc định) - Mật khẩu: beanh1510
  "dincox": {
    name: "DinCox",
    hash: "a518306ed5529f68af96b34ec3bc784301413dedcd8c33e632c96155a1f88d4c",
    subtitle: "Giày Chuẩn EU - Giá Ưu Việt"
  },

  // Brand 2: Demo Partner Brand (Mẫu thử nghiệm) - Mật khẩu: demo@2026
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

  // 1. Kiểm tra quyền Master Admin (Admin có thể mở khóa bất kỳ Brand nào)
  if (inputHash === MASTER_PASSWORD_HASH) {
    const finalBrand = (brandName && brandName.trim()) ? brandName.trim() : 'DinCox';
    const sessionToken = await sha256(`admin:${finalBrand.toLowerCase()}:${inputHash}`);
    return { 
      success: true, 
      brand: finalBrand, 
      sessionToken, 
      isAdmin: true,
      subtitle: finalBrand.toLowerCase() === 'dincox' ? 'Giày Chuẩn EU - Giá Ưu Việt' : `${finalBrand} • Official Live Stream`
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
 * Kiểm tra xem phiên đăng nhập hiện tại có hợp lệ không
 */
export async function validateStoredSession() {
  try {
    const storedToken = localStorage.getItem('dincox_studio_auth_token');
    const storedBrand = localStorage.getItem('dincox_studio_branch') || 'DinCox';
    const legacyAuth = localStorage.getItem('dincox_studio_authenticated');

    if (!storedToken && legacyAuth !== 'true') {
      return false;
    }

    // Nếu đã có token, verify token khớp với master hoặc brand
    if (storedToken) {
      const brandKey = storedBrand.trim().toLowerCase();
      const expectedAdminToken = await sha256(`admin:${brandKey}:${MASTER_PASSWORD_HASH}`);
      if (storedToken === expectedAdminToken) return true;

      const brandConfig = AUTHORIZED_BRANDS[brandKey];
      if (brandConfig) {
        const expectedBrandToken = await sha256(`brand:${brandKey}:${brandConfig.hash}`);
        if (storedToken === expectedBrandToken) return true;
      }
    }

    // Backward-compatibility: Nếu trước đó đã lưu cờ 'true' với master password
    if (legacyAuth === 'true') {
      return true;
    }

    return false;
  } catch (e) {
    console.warn("Session validation error:", e);
    return false;
  }
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
