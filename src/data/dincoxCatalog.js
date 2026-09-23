// DinCox Official Product Catalog & Livestream Script Generator Engine

export let DINCOX_PRODUCTS = [
  {
    id: 'dc47',
    enabled: true,
    name: 'Giày Sneaker Nam DinCox DC47 Vulcanized',
    code: 'DC47-NAVY',
    category: 'Sneaker Ý - Cao Su Lưu Hóa',
    originalPrice: 790000,
    salePrice: 489000,
    discountPercent: 38,
    voucherCode: 'DINCOX50K',
    voucherValue: '50.000đ',
    image: './assets/dincox_dc47.png',
    rating: 4.9,
    soldCount: 1420,
    stockCount: 12,
    sizes: ['39', '40', '41', '42', '43'],
    features: [
      'Công nghệ đế cao su lưu hóa (Vulcanized) 100% bám đường',
      'Lót giày Memory Foam thoáng khí, êm ái từng bước chân',
      'Kiểu dáng Sneaker Ý thanh lịch, tôn dáng nam tính',
      'Bảo hành 12 tháng chính hãng Shopee Mall'
    ]
  },
  {
    id: 'e12',
    enabled: true,
    name: 'Giày Canvas DinCox E12 Classic White',
    code: 'E12-WHT',
    category: 'Canvas Quốc Dân',
    originalPrice: 520000,
    salePrice: 349000,
    discountPercent: 33,
    voucherCode: 'DINCOX30K',
    voucherValue: '30.000đ',
    image: './assets/dincox_e12.png',
    rating: 5.0,
    soldCount: 3890,
    stockCount: 8,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    features: [
      'Chất liệu vải Canvas cao cấp bền màu, dễ vệ sinh',
      'Phù hợp cho cả nam và nữ (Unisex phong cách tối giản)',
      'Đường may tỉ mỉ xuất khẩu Châu Âu',
      'Đổi trả 1-1 trong 7 ngày nếu không vừa size'
    ]
  },
  {
    id: 'c40',
    enabled: true,
    name: 'Giày Sneaker Streetwear DinCox C40 Black Gum',
    code: 'C40-BLK',
    category: 'Streetwear Đế Bằng',
    originalPrice: 650000,
    salePrice: 399000,
    discountPercent: 38,
    voucherCode: 'DINCOX50K',
    voucherValue: '50.000đ',
    image: './assets/dincox_c40.png',
    rating: 4.8,
    soldCount: 2150,
    stockCount: 5,
    sizes: ['38', '39', '40', '41', '42', '43'],
    features: [
      'Phối màu Black & Gum cá tính chuẩn phong cách phố',
      'Đế cao su dẻo chịu lực tốt, chống mài mòn',
      'Form cứng cáp không bị gãy gập',
      'Cam kết hàng chính hãng 100% Shopee Mall'
    ]
  },
  {
    id: 'e10',
    enabled: true,
    name: 'Giày Sục DinCox E10 Mule Canvas Slip-On',
    code: 'E10-MULE',
    category: 'Mule Đạp Gót Tiện Lợi',
    originalPrice: 480000,
    salePrice: 299000,
    discountPercent: 37,
    voucherCode: 'DINCOX20K',
    voucherValue: '20.000đ',
    image: './assets/dincox_e10.png',
    rating: 4.9,
    soldCount: 1840,
    stockCount: 15,
    sizes: ['36', '37', '38', '39', '40', '41'],
    features: [
      'Thiết kế đạp gót Mule tiện dụng xỏ chân 1 giây',
      'Gam màu Beige nhã nhặn dễ phối quần áo',
      'Đệm êm ái thoáng mát mùa hè',
      'Thiết kế thời trang năng động'
    ]
  }
];

export const PRESENTERS = [
  {
    id: 'female_an',
    name: 'MC Hải An (AI Nữ)',
    avatar: './assets/presenter_female.png',
    gender: 'female',
    style: 'Năng động, tươi vui, chuyên nghiệp',
    voicePitch: 1.2,
    voiceRate: 1.05
  },
  {
    id: 'male_duc',
    name: 'MC Minh Đức (AI Nam)',
    avatar: './assets/presenter_male.png',
    gender: 'male',
    style: 'Trẻ trung, lôi cuốn, ấm áp',
    voicePitch: 0.7,
    voiceRate: 0.95
  }
];

export const SHOPEE_OFFICIAL_DINCOX_CATALOG = [
  {
    id: 'dc39',
    enabled: true,
    name: 'Giày Sneaker Da DinCox DC39 Modern Leather',
    code: 'DC39-WHT',
    category: 'Da Microfiber Cao Cấp',
    originalPrice: 890000,
    salePrice: 549000,
    discountPercent: 38,
    voucherCode: 'DINCOX50K',
    voucherValue: '50.000đ',
    image: './assets/dincox_dc47.png',
    rating: 4.9,
    soldCount: 1980,
    stockCount: 10,
    sizes: ['39', '40', '41', '42', '43'],
    features: [
      'Chất liệu da Microfiber chống thấm nước, dễ lau chùi',
      'Form ôm chuẩn Châu Âu tôn dáng quý ông',
      'Bảo hành 12 tháng keo chỉ chính hãng DinCox'
    ]
  },
  {
    id: 'c12',
    enabled: true,
    name: 'Giày Canvas DinCox C12 Retro High Top',
    code: 'C12-HIGH',
    category: 'Canvas Cổ Cao Retro',
    originalPrice: 580000,
    salePrice: 379000,
    discountPercent: 35,
    voucherCode: 'DINCOX30K',
    voucherValue: '30.000đ',
    image: './assets/dincox_e12.png',
    rating: 4.8,
    soldCount: 1250,
    stockCount: 7,
    sizes: ['38', '39', '40', '41', '42'],
    features: [
      'Thiết kế cổ cao Vintage bảo vệ cổ chân',
      'Đế cao su lưu hóa đúc nguyên khối',
      'Tặng kèm dây giày phong cách'
    ]
  },
  {
    id: 'd14',
    enabled: true,
    name: 'Giày Tây Sneaker DinCox D14 Smart Casual',
    code: 'D14-SMART',
    category: 'Smart Casual Công Sở',
    originalPrice: 920000,
    salePrice: 599000,
    discountPercent: 35,
    voucherCode: 'DINCOX50K',
    voucherValue: '50.000đ',
    image: './assets/dincox_c40.png',
    rating: 5.0,
    soldCount: 890,
    stockCount: 6,
    sizes: ['39', '40', '41', '42', '43'],
    features: [
      'Sự kết hợp hoàn hảo giữa giày tây và sneaker linh hoạt',
      'Lót Memory Foam chống mỏi chân khi đứng nhiều',
      'Phù hợp đi làm công sở và sự kiện'
    ]
  },
  {
    id: 'e15',
    enabled: true,
    name: 'Giày Sục DinCox E15 Minimalist Black',
    code: 'E15-BLK',
    category: 'Mule Slip-on Đen Tối Giản',
    originalPrice: 490000,
    salePrice: 319000,
    discountPercent: 35,
    voucherCode: 'DINCOX20K',
    voucherValue: '20.000đ',
    image: './assets/dincox_e10.png',
    rating: 4.9,
    soldCount: 1670,
    stockCount: 14,
    sizes: ['36', '37', '38', '39', '40', '41'],
    features: [
      'Phối màu đen thanh lịch không sợ bẩn',
      'Đế bám tốt chống trượt mưa ướt',
      'Xỏ chân 1 giây vô cùng tiện lợi'
    ]
  }
];

// Extracted 36 real products directly from https://www.dincox.com/collections/san-pham
export const OFFICIAL_WEB_DINCOX_CATALOG = [
  {
    "id": "web_dc51_gold_rush",
    "enabled": true,
    "name": "DC51 GOLD RUSH",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6881_copy_b72ac8ca6ce04344968ea41b5a30b613.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc51_nut_brown",
    "enabled": true,
    "name": "DC51 NUT BROWN",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6855_copy_00a399511aa540ac9da5990d87be88c5.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc51_moon_ash",
    "enabled": true,
    "name": "DC51 MOON ASH",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6867_copy_1f67a779803f4683b1c9d2ecfc5c90cd.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc51_deep_ocean",
    "enabled": true,
    "name": "DC51 DEEP OCEAN",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6809_1_copy_2_53bf1ef743934f569074d589f71001a3.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc51_violet_dusk",
    "enabled": true,
    "name": "DC51 VIOLET DUSK",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6782_copy_8baea6b3c0b8477ebc8f831f4e3f3107.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc51_sun_shine",
    "enabled": true,
    "name": "DC51 SUN SHINE",
    "code": "DC51",
    "category": "DinCox Web Official",
    "originalPrice": 690000,
    "salePrice": 535000,
    "discountPercent": 22,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a6833_copy_fc75d59f03454cc4a1406ec25047f54b.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_toffee",
    "enabled": true,
    "name": "DC50 TOFFEE",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2593_copy_2_2e7841a7e2bd4d9eadf592e07cb2e369.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_winy",
    "enabled": true,
    "name": "DC50 WINY",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2564_copy_2_b3d616f0a4f04beb899c7b4cd2206bea.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_raven",
    "enabled": true,
    "name": "DC50 RAVEN",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2602_copy_2_9952c1a735304e2d93a24d0d82870333.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_magnet",
    "enabled": true,
    "name": "DC50 MAGNET",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2579_copy_2_18183edede24408fb4b1ea1edfbe5445.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_weed",
    "enabled": true,
    "name": "DC50 WEED",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2535_copy_2_a83f6ba3ed164e75a2f220023c005e16.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc50_rusty",
    "enabled": true,
    "name": "DC50 RUSTY",
    "code": "DC50",
    "category": "DinCox Web Official",
    "originalPrice": 660000,
    "salePrice": 535000,
    "discountPercent": 19,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2555_copy_2_68f97ff702904c11a4c6b2e019b2cc1b.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_urban_moss",
    "enabled": true,
    "name": "DC48 URBAN MOSS",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7514_copy_16e494723bfe489aae20825a77da3f12.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_brown_alley",
    "enabled": true,
    "name": "DC48 BROWN ALLEY",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7543_copy_c5c899d9567643bf8a28bc74e536ec0a.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_smoke_drift",
    "enabled": true,
    "name": "DC48 SMOKE DRIFT",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7501_copy_b0e84c82530c4403b1ff69c95301b043.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_shadow_move",
    "enabled": true,
    "name": "DC48 SHADOW MOVE",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7557_copy_298c5776b547401993580a9668f35db8.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_brick_sunset",
    "enabled": true,
    "name": "DC48 BRICK SUNSET",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7491_copy_b44094f71e0447b086f200d5b4e238cd.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_city_stripe",
    "enabled": true,
    "name": "DC48 CITY STRIPE",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7616_copy_029900041c6f48dbaf529b16be01d27a.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc48_midnight_amber",
    "enabled": true,
    "name": "DC48 MIDNIGHT AMBER",
    "code": "DC48",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_7528_copy_e0014aab1ce746a9885830b7ab6de04b.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc39_latte_love",
    "enabled": true,
    "name": "DC39 LATTE LOVE",
    "code": "DC39",
    "category": "DinCox Web Official",
    "originalPrice": 555000,
    "salePrice": 535000,
    "discountPercent": 4,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2808_copy_46a0e842c33b4e77a0160e177814c0ed.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47_v_ng_v_ng",
    "enabled": true,
    "name": "DC47 VỮNG VÀNG",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_v_ng_v_ng_aec679bc47bc465d9a3c0a7d06704fb9.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47_b_ng_n_",
    "enabled": true,
    "name": "DC47 BÙNG NỔ",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_b_ng_n__4039d8d4a3a34c0a860a4bdfa4e8bfe8.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47_kh_i___u",
    "enabled": true,
    "name": "DC47 KHỞI ĐẦU",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_kh_i_d_u_224516bbdf0944079e3b2aaf1148f819.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47__am_m_",
    "enabled": true,
    "name": "DC47 ĐAM MÊ",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_dam_m__135f75a561e944979a5de235a911c8c0.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47_ki_n_tr_",
    "enabled": true,
    "name": "DC47 KIÊN TRÌ",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_ki_n_tr__3a4e1d5c1b6d4416a28037c564ea13b2.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc39_coco_milk",
    "enabled": true,
    "name": "DC39 COCO MILK",
    "code": "DC39",
    "category": "DinCox Web Official",
    "originalPrice": 555000,
    "salePrice": 535000,
    "discountPercent": 4,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2848_copy_ed34f23a3b2f45afb1a9f1d300b8bf7e.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc39_black_coffee",
    "enabled": true,
    "name": "DC39 BLACK COFFEE",
    "code": "DC39",
    "category": "DinCox Web Official",
    "originalPrice": 555000,
    "salePrice": 535000,
    "discountPercent": 4,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc39_black_coffee_0bdd7d4cf1244064b8583d0e6373ffb2.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc39_berry_soda",
    "enabled": true,
    "name": "DC39 BERRY SODA",
    "code": "DC39",
    "category": "DinCox Web Official",
    "originalPrice": 555000,
    "salePrice": 535000,
    "discountPercent": 4,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc39_berry_soda_05312ef94c7b4c5dbd7b9d209f99849c.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc47_b_t_ph_",
    "enabled": true,
    "name": "DC47 BỨT PHÁ",
    "code": "DC47",
    "category": "DinCox Web Official",
    "originalPrice": 585000,
    "salePrice": 535000,
    "discountPercent": 9,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc47_b_t_ph__238f57c361e64142ab8f9bbbbf25fa7a.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_ballerina_dusty_rose",
    "enabled": true,
    "name": "Ballerina Dusty Rose",
    "code": "Ballerina",
    "category": "DinCox Web Official",
    "originalPrice": 565000,
    "salePrice": 535000,
    "discountPercent": 5,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc0342_copy_2_8965a5b516cd4a20983553c3a0cea199.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_ballerina_pink_milk",
    "enabled": true,
    "name": "Ballerina Pink Milk",
    "code": "Ballerina",
    "category": "DinCox Web Official",
    "originalPrice": 565000,
    "salePrice": 535000,
    "discountPercent": 5,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc49_pink_milk__v1__0db2b944c3db47f582a02f61f081f2d0.png",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_ballerina_black_pink",
    "enabled": true,
    "name": "Ballerina Black Pink",
    "code": "Ballerina",
    "category": "DinCox Web Official",
    "originalPrice": 565000,
    "salePrice": 535000,
    "discountPercent": 5,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/dc0383_copy_2_978ea4254b7a42629b028ca70bb400a3.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc49_ballerina_baby_blush",
    "enabled": true,
    "name": "DC49 Ballerina Baby Blush",
    "code": "DC49",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a7783_copy_aaeaee9b6b1344a8961cf7d06a8b196e.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc49_ballerina_lolipop",
    "enabled": true,
    "name": "DC49 Ballerina Lolipop",
    "code": "DC49",
    "category": "DinCox Web Official",
    "originalPrice": 615250,
    "salePrice": 535000,
    "discountPercent": 13,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a7770_copy_06f1fb5e4dde4f1997dd67c00f988a35.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc36_white_gum",
    "enabled": true,
    "name": "DC36 WHITE GUM",
    "code": "DC36",
    "category": "DinCox Web Official",
    "originalPrice": 580000,
    "salePrice": 535000,
    "discountPercent": 8,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/_mg_2901_copy_2_d6fdeb44f54241dc8745085464dd8317.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  },
  {
    "id": "web_dc36_white_purple",
    "enabled": true,
    "name": "DC36 WHITE PURPLE",
    "code": "DC36",
    "category": "DinCox Web Official",
    "originalPrice": 580000,
    "salePrice": 535000,
    "discountPercent": 8,
    "voucherCode": "DINCOX50K",
    "voucherValue": "50.000đ",
    "image": "https://cdn.hstatic.net/products/1000365025/1l8a9207_copy_3_ea5ce437792148b58be2ea7964c16f5d.jpg",
    "stockCount": 12,
    "features": [
      "Sản phẩm chính hãng DinCox Shoes từ website dincox.com",
      "Công nghệ lót Latex Memory Foam siêu êm chân",
      "Đế cao su lưu hóa (Vulcanized) 100% chống trượt"
    ]
  }
];

export function addProductToCatalog(product) {
  if (product.enabled === undefined) product.enabled = true;
  const existingIdx = DINCOX_PRODUCTS.findIndex(p => p.id === product.id);
  if (existingIdx >= 0) {
    DINCOX_PRODUCTS[existingIdx] = product;
  } else {
    DINCOX_PRODUCTS.push(product);
  }
  saveProductsCatalogToLocalStorage();
  return product;
}

export function updateProductInCatalog(id, fields) {
  const prod = DINCOX_PRODUCTS.find(p => p.id === id);
  if (prod) {
    Object.assign(prod, fields);
    if (prod.originalPrice && prod.salePrice) {
      prod.discountPercent = Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100);
    }
  }
  saveProductsCatalogToLocalStorage();
  return prod;
}

export function toggleProductEnabled(id, enabledState) {
  const prod = DINCOX_PRODUCTS.find(p => p.id === id);
  if (prod) {
    prod.enabled = enabledState !== undefined ? enabledState : !prod.enabled;
  }
  saveProductsCatalogToLocalStorage();
  return prod;
}

export function clearAllProductsFromCatalog() {
  const removedCount = DINCOX_PRODUCTS.length;
  DINCOX_PRODUCTS.length = 0;
  saveProductsCatalogToLocalStorage();
  return removedCount;
}

export function importShopeeOfficialCatalog() {
  let addedCount = 0;
  SHOPEE_OFFICIAL_DINCOX_CATALOG.forEach(item => {
    if (!DINCOX_PRODUCTS.some(p => p.id === item.id)) {
      DINCOX_PRODUCTS.push({ ...item, enabled: true });
      addedCount++;
    }
  });
  saveProductsCatalogToLocalStorage();
  return addedCount;
}

export function importWebDincoxCatalog() {
  let addedCount = 0;
  OFFICIAL_WEB_DINCOX_CATALOG.forEach(item => {
    if (!DINCOX_PRODUCTS.some(p => p.id === item.id)) {
      DINCOX_PRODUCTS.push({ ...item, enabled: true });
      addedCount++;
    }
  });
  saveProductsCatalogToLocalStorage();
  return addedCount;
}

export function parseBatchProductsList(rawText) {
  if (!rawText.trim()) return [];

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsed = [];

  lines.forEach((line, idx) => {
    let parts = line.split('|').map(p => p.trim());
    if (parts.length < 2) {
      parts = line.split(',').map(p => p.trim());
    }

    const name = parts[0] || `Giày DinCox Mẫu ${idx + 1}`;
    const orig = parseInt(parts[1], 10) || 690000;
    const sale = parseInt(parts[2], 10) || (parts[1] ? Math.round(orig * 0.65) : 399000);
    const feat = parts[3] || 'Lót Memory Foam siêu êm, Giày Chuẩn EU';

    const item = {
      id: 'batch_' + Date.now() + '_' + idx,
      enabled: true,
      name,
      code: 'DC-CUSTOM-' + (idx + 1),
      category: 'DinCox Shopee Mall',
      originalPrice: orig,
      salePrice: sale,
      discountPercent: Math.round(((orig - sale) / orig) * 100),
      voucherCode: 'DINCOX50K',
      voucherValue: '50.000đ',
      image: './assets/dincox_dc47.png',
      stockCount: 10,
      features: [
        feat,
        'Công nghệ đế cao su lưu hóa (Vulcanized) chống trượt',
        'Bảo hành 12 tháng chính hãng Shopee Mall'
      ]
    };

    addProductToCatalog(item);
    parsed.push(item);
  });

  saveProductsCatalogToLocalStorage();
  return parsed;
}

// LocalStorage Custom Script & Product Catalog Persistence
const SCRIPTS_STORAGE_KEY = 'dincox_custom_scripts_v1';
const CATALOG_STORAGE_KEY = 'dincox_custom_products_catalog_v2';

export function saveProductsCatalogToLocalStorage() {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(DINCOX_PRODUCTS));
  } catch (e) {
    console.warn("Could not save products catalog to localStorage:", e);
  }
}

export function restoreProductsCatalogFromLocalStorage() {
  try {
    const jsonStr = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        DINCOX_PRODUCTS.length = 0;
        parsed.forEach(p => {
          if (p.image && typeof p.image === 'string' && p.image.startsWith('/assets/')) {
            p.image = '.' + p.image;
          }
          DINCOX_PRODUCTS.push(p);
        });
      }
    }
  } catch (e) {
    console.warn("Could not restore products catalog from localStorage:", e);
  }
}

export function exportAllProductsCatalogJSON() {
  const exportData = DINCOX_PRODUCTS.map(prod => {
    return {
      ...prod,
      scriptStages: generateScriptForProduct(prod)
    };
  });
  return JSON.stringify(exportData, null, 2);
}

export function importAllProductsCatalogJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    const list = Array.isArray(parsed) ? parsed : (parsed.products || []);
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error("Tệp JSON không chứa danh sách sản phẩm hợp lệ!");
    }

    DINCOX_PRODUCTS.length = 0;
    list.forEach((item, index) => {
      const prod = {
        id: item.id || `custom_import_${Date.now()}_${index}`,
        enabled: item.enabled !== false,
        name: item.name || 'Sản Phẩm Chưa Đặt Tên',
        code: item.code || `DC-${index + 1}`,
        category: item.category || 'Giày DinCox',
        originalPrice: Number(item.originalPrice) || 500000,
        salePrice: Number(item.salePrice) || 299000,
        discountPercent: Number(item.discountPercent) || Math.round((1 - (Number(item.salePrice) || 299000) / (Number(item.originalPrice) || 500000)) * 100),
        voucherCode: item.voucherCode || 'DINCOX50K',
        voucherValue: item.voucherValue || '50.000đ',
        image: item.image !== undefined ? item.image : '',
        rating: item.rating || 5.0,
        soldCount: item.soldCount || 100,
        stockCount: item.stockCount || 10,
        sizes: Array.isArray(item.sizes) ? item.sizes : ['39', '40', '41', '42'],
        features: Array.isArray(item.features) ? item.features : [item.feature || 'Sản phẩm chính hãng DinCox']
      };

      DINCOX_PRODUCTS.push(prod);

      // Save custom script if attached
      if (Array.isArray(item.scriptStages) && item.scriptStages.length > 0) {
        saveProductScript(prod.id, item.scriptStages);
      }
    });

    saveProductsCatalogToLocalStorage();
    return DINCOX_PRODUCTS.length;
  } catch (err) {
    alert(`⚠️ Lỗi đọc tệp JSON Sản phẩm: ${err.message}`);
    return 0;
  }
}

function getAllCustomScriptsMap() {
  try {
    const raw = localStorage.getItem(SCRIPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to parse custom scripts from storage:", e);
    return {};
  }
}

export function saveProductScript(productId, scriptStages) {
  const map = getAllCustomScriptsMap();
  map[productId] = scriptStages;
  try {
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save script to localStorage:", e);
  }
}

export function resetProductScript(productId) {
  const map = getAllCustomScriptsMap();
  delete map[productId];
  try {
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to reset script in localStorage:", e);
  }
}

export function exportAllScriptsJSON() {
  const customMap = getAllCustomScriptsMap();
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    products: DINCOX_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      script: customMap[p.id] || generateScriptForProduct(p)
    }))
  };
  return JSON.stringify(exportData, null, 2);
}

export function importAllScriptsJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error("Cấu trúc tệp JSON không hợp lệ (Thiếu danh sách products)!");
    }
    const map = getAllCustomScriptsMap();
    let updatedCount = 0;
    data.products.forEach(item => {
      if (item.id && item.script) {
        map[item.id] = item.script;
        updatedCount++;
      }
    });
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(map));
    return updatedCount;
  } catch (e) {
    alert("⚠️ Lỗi nạp tệp kịch bản: " + e.message);
    return 0;
  }
}

export function moveProductInCatalog(id, direction) {
  const index = DINCOX_PRODUCTS.findIndex(p => p.id === id);
  if (index === -1) return false;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= DINCOX_PRODUCTS.length) return false;

  const temp = DINCOX_PRODUCTS[index];
  DINCOX_PRODUCTS[index] = DINCOX_PRODUCTS[targetIndex];
  DINCOX_PRODUCTS[targetIndex] = temp;
  saveProductsCatalogToLocalStorage();
  return true;
}

export const TRANSITION_PHRASES = [
  (prev, next) => `Vừa rồi là mẫu ${prev ? prev.name : 'giày'} cực kỳ hot! Và ngay bây giờ, hãy cùng shop chuyển sang mẫu tiếp theo không thể bỏ qua: ${next.name}!`,
  (prev, next) => `Mọi người đã chốt size mẫu vừa rồi chưa ạ? Ngay sau đây em xin lên sóng mẫu ${next.name} đang được săn đón ráo riết trên gian hàng DinCox!`,
  (prev, next) => `Tiếp nối phiên live hôm nay, shop mang đến cho cả nhà một thiết kế siêu êm ái và ưu đãi cực hời: ${next.name}!`,
  (prev, next) => `Dạ tiếp theo đây, các tín đồ nhà DinCox nhất định không thể rời mắt khỏi siêu phẩm ${next.name} này nhé!`,
  (prev, next) => `Cả nhà mình cùng chuyển qua mẫu mới tiếp theo nha! Ngay trên màn hình lúc này là ${next.name} chuẩn EU!`
];

export function getRandomTransitionPhrase(prevProd, nextProd) {
  const fn = TRANSITION_PHRASES[Math.floor(Math.random() * TRANSITION_PHRASES.length)];
  return fn(prevProd, nextProd);
}

export function generateScriptForProduct(product) {
  if (!product) {
    return [
      { stage: 'Intro', text: 'Xin chào tất cả mọi người đang theo dõi phiên Shopee Live chính hãng của DinCox!', duration: 5 },
      { stage: 'Highlights', text: 'Sản phẩm nổi bật với định hướng Giày Chuẩn EU - Giá Ưu Việt. Lót Memory Foam siêu êm.', duration: 7 },
      { stage: 'Deal & Voucher', text: 'Duy nhất trong phiên Live hôm nay, giá gốc ưu đãi lớn!', duration: 8 },
      { stage: 'Call to Action', text: 'Số lượng có hạn! Mọi người bấm ngay vào giỏ hàng góc trái bên dưới để săn size chuẩn nhé!', duration: 6 }
    ];
  }

  // Check if custom user script exists in localStorage
  const customMap = getAllCustomScriptsMap();
  if (product.id && customMap[product.id] && Array.isArray(customMap[product.id]) && customMap[product.id].length > 0) {
    return customMap[product.id];
  }

  // Default script generator
  const formattedSalePrice = new Intl.NumberFormat('vi-VN').format(product.salePrice) + 'đ';
  const formattedOrigPrice = new Intl.NumberFormat('vi-VN').format(product.originalPrice) + 'đ';
  const mainFeature = product.features && product.features[0] ? product.features[0] : 'Lót Memory Foam siêu êm';

  return [
    {
      stage: 'Intro',
      text: `Xin chào tất cả mọi người đang theo dõi phiên Shopee Live chính hãng của DinCox! Hôm nay shop xin giới thiệu mẫu ${product.name}!`,
      duration: 5
    },
    {
      stage: 'Highlights',
      text: `Sản phẩm nổi bật với định hướng Giày Chuẩn EU - Giá Ưu Việt. ${mainFeature}.`,
      duration: 7
    },
    {
      stage: 'Deal & Voucher',
      text: `Duy nhất trong phiên Live hôm nay, giá gốc ${formattedOrigPrice} giảm trực tiếp ${product.discountPercent || 35}% chỉ còn ${formattedSalePrice}! Áp thêm voucher ${product.voucherCode || 'DINCOX50K'} giảm ngay ${product.voucherValue || '50.000đ'}!`,
      duration: 8
    },
    {
      stage: 'Call to Action',
      text: `Số lượng quà tặng và kho hàng sale chỉ còn vài đôi! Mọi người bấm ngay vào giỏ hàng góc trái bên dưới để săn size chuẩn và nhận ưu đãi nhé!`,
      duration: 6
    }
  ];
}

// Automatically restore saved catalog from localStorage on load
restoreProductsCatalogFromLocalStorage();
