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
    image: '/assets/dincox_dc47.png',
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
    image: '/assets/dincox_e12.png',
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
    image: '/assets/dincox_c40.png',
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
    image: '/assets/dincox_e10.png',
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
    avatar: '/assets/presenter_female.png',
    gender: 'female',
    style: 'Năng động, tươi vui, chuyên nghiệp',
    voicePitch: 1.2,
    voiceRate: 1.05
  },
  {
    id: 'male_duc',
    name: 'MC Minh Đức (AI Nam)',
    avatar: '/assets/presenter_male.png',
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
    image: '/assets/dincox_dc47.png',
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
    image: '/assets/dincox_e12.png',
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
    image: '/assets/dincox_c40.png',
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
    image: '/assets/dincox_e10.png',
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_gold_rush_ae41bd5eef89481d84665e892e809245.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_nut_brown_e9cad4bbb26342ab8fa278747005b4c1.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_moon_ash_94ff2005c78f4dedb54b8ae014223247.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_deep_ocean_34752411f0e7466598ea1118a36e2a00.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_violet_dusk_2c224f254fe749b4957432f67dddb344.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc51_sunshine_d4c958c09ee4416da5254f2e2c99dc10.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_toffee_752b0bb128f64cd48a687217c35b0318.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_winy_945606b0ab134432b3ea53286de630b9.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_raven_76255d4773ca42d79b8ee54822afa8a7.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_magnet_80b90eecc0d04069902e8eb5bef01015.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_weed_1d57ffb1d58a4646a1c810e13056bd82.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc50_rusty_dd9e4dde31c14e06b343da89fb523f0b.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_urban_moss_70d49c24c3584d1a86e71f3e39e2194d.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_brown_alley_b327b83e6f724d4bbde4f7551b4b4e38.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_smoke_drift_b86a64245cd94dd1a825c8941cef10d3.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_shadow_move_961c197f582e4c7b9c837cca1143303b.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_brick_sunset_45ed3fbfc7a14292a40558cbfbe0f918.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_city_stripe_502bb9f2df4a4617afa350ed644e1ed2.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc48_midnight_amber_b7fad32eecdd4c2abe4af3d22a1c21cc.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc39_latte_love_09501f1e687647e9a03e345d67f483a6.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc39_coco_milk_66bc6610e53d47f386849fed1e70c4c0.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc49_dusty_rose_9dadb7416d864d46ade65207dece959f.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc49_black_pink_v1_93534038fe874a8d9c5d89aab5cae850.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc49_baby_blush_050d8786fcbb414083297311e835579d.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc49_lolilop_db249237de5c4856bd60f1e178a354b5.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc36_white_gum_a99cdc40caf240ccaeabfb509895c03b.png",
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
    "image": "https://cdn.hstatic.net/products/1000365025/dc36_white_purple_c15c7c5f4047441b95da42d0601cc815.png",
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
  return prod;
}

export function toggleProductEnabled(id, enabledState) {
  const prod = DINCOX_PRODUCTS.find(p => p.id === id);
  if (prod) {
    prod.enabled = enabledState !== undefined ? enabledState : !prod.enabled;
  }
  return prod;
}

export function importShopeeOfficialCatalog() {
  let addedCount = 0;
  SHOPEE_OFFICIAL_DINCOX_CATALOG.forEach(item => {
    if (!DINCOX_PRODUCTS.some(p => p.id === item.id)) {
      DINCOX_PRODUCTS.push({ ...item, enabled: true });
      addedCount++;
    }
  });
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
      image: '/assets/dincox_dc47.png',
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

  return parsed;
}

export function generateScriptForProduct(product) {
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
