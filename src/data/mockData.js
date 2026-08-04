export const CATEGORIES = [
  { id: 'all', name: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'cosmetics', name: { uz: 'Kosmetika', ru: 'Косметика', en: 'Cosmetics' } },
  { id: 'flowers', name: { uz: 'Gullar', ru: 'Цветы', en: 'Flowers' } },
  { id: 'men', name: { uz: 'Erkaklar modasi', ru: 'Мужская мода', en: "Men's Fashion" } },
  { id: 'women', name: { uz: 'Ayollar modasi', ru: 'Женская мода', en: "Women's Fashion" } },
  { id: 'electronics', name: { uz: 'Elektronika', ru: 'Электроника', en: 'Electronics' } },
];

export const BANNERS = [
  {
    id: 1,
    title: { uz: 'SPRING BOUQUET', ru: 'SPRING BOUQUET', en: 'SPRING BOUQUET' },
    subtitle: { uz: 'Gullar kolleksiyasi 2026', ru: 'Коллекция цветов 2026', en: 'Flower Collection 2026' },
    image: '/images/spring_bouquet.png',
    badge: { uz: 'YANGI', ru: 'НОВИНКА', en: 'NEW' },
    buttonText: { uz: 'Ko\'rish', ru: 'Смотреть', en: 'View' }
  },
  {
    id: 2,
    title: { uz: 'Madagascar Centella Skincare', ru: 'Madagascar Centella Skincare', en: 'Madagascar Centella Skincare' },
    subtitle: { uz: 'Tabiiy parvarish va go\'zallik', ru: 'Натуральный уход и красота', en: 'Natural Care and Beauty' },
    image: '/images/skincare_banner.png',
    badge: { uz: 'TOP', ru: 'ТОП', en: 'TOP' },
    buttonText: { uz: 'Batafsil', ru: 'Подробнее', en: 'Details' }
  },
  {
    id: 3,
    title: { uz: 'Yozgi Kolleksiya 2026', ru: 'Летняя Коллекция 2026', en: 'Summer Collection 2026' },
    subtitle: { uz: 'Zamonaviy kiyimlar to\'plami', ru: 'Стильная одежда', en: 'Stylish clothing collection' },
    image: '/images/mens_fashion_banner.png',
    badge: { uz: 'MODA', ru: 'МОДА', en: 'FASHION' },
    buttonText: { uz: 'Tanlash', ru: 'Выбрать', en: 'Select' }
  },
  {
    id: 4,
    title: { uz: 'Premium Elektronika', ru: 'Премиум Электроника', en: 'Premium Electronics' },
    subtitle: { uz: 'Eng yaxshi naushniklar va gadjetlar', ru: 'Лучшие наушники и гаджеты', en: 'Best headphones and gadgets' },
    image: '/images/electronics_banner.png',
    badge: { uz: 'AKSION', ru: 'АКЦИЯ', en: 'SALE' },
    buttonText: { uz: 'Ko\'rish', ru: 'Смотреть', en: 'View' }
  }
];


export const PRODUCTS = [
  {
    id: 'p1',
    categoryId: 'cosmetics',
    title: { uz: "L'Oréal Paris Bambi Eye Mascarasi", ru: "L'Oréal Paris Bambi Eye Mascarasi", en: "L'Oréal Paris Bambi Eye Mascara" },
    description: {
      uz: 'Kipriklarga maksimal hajm va uzunlik beruvchi professional tush. Suv va terga chidamli formula.',
      ru: 'Профессиональная тушь для максимального объема и удлинения ресниц. Водостойкая и устойчивая формула.',
      en: 'Professional mascara that gives maximum volume and length to lashes. Water and sweat resistant formula.'
    },
    price: 100000,
    oldPrice: null,
    stock: 7,
    image: '/images/mascara.png',
    images: ['/images/mascara.png']
  },
  {
    id: 'p2',
    categoryId: 'cosmetics',
    title: { uz: 'Ампула SKIN1004 с центеллой', ru: 'Ампула SKIN1004 с центеллой', en: 'SKIN1004 Centella Ampoule' },
    description: {
      uz: 'Centella asiatica o\'simligidan tayyorlangan terini tinchlantiruvchi va namlantiruvchi ampula.',
      ru: 'Успокаивающая и увлажняющая ампула на основе экстракта центеллы азиатской.',
      en: 'Soothing and hydrating ampoule made with pure Centella Asiatica extract.'
    },
    price: 100000,
    oldPrice: null,
    stock: 3,
    image: '/images/centella.png',
    images: ['/images/centella.png']
  },
  {
    id: 'p3',
    categoryId: 'cosmetics',
    title: { uz: 'NARS Radiant Krem Konsiler', ru: 'NARS Radiant Krem Konsiler', en: 'NARS Radiant Creamy Concealer' },
    description: {
      uz: 'Yuqori qoplamali, namlantiruvchi va tabiiy ko\'rinish beruvchi konsiler.',
      ru: 'Высокое покрытие, увлажняющий консилер с естественным финишем.',
      en: 'High coverage, hydrating, and natural-looking creamy concealer.'
    },
    price: 90000,
    oldPrice: 130000,
    stock: 1,
    image: '/images/concealer.png',
    images: ['/images/concealer.png']
  },
  {
    id: 'p4',
    categoryId: 'cosmetics',
    title: { uz: 'Revolution bronzeri', ru: 'Revolution bronzeri', en: 'Revolution Compact Bronzer' },
    description: {
      uz: 'Yuzga tabiiy bronz rang beruvchi kompakt pudra.',
      ru: 'Компактная пудра для естественного бронзового сияния.',
      en: 'Compact powder for a natural bronze glow.'
    },
    price: 150000,
    oldPrice: null,
    stock: 1,
    image: '/images/bronzer.png',
    images: ['/images/bronzer.png']
  },
  {
    id: 'p5',
    categoryId: 'flowers',
    title: { uz: 'Букет красных роз', ru: 'Букет красных роз', en: 'Red Roses Bouquet' },
    description: {
      uz: 'Qizil gullardan iborat chiroyli guldasta.',
      ru: 'Красивый букет из свежих красных роз, перевязанный лентой.',
      en: 'A beautiful bouquet of fresh red roses wrapped with a ribbon.'
    },
    price: 300000,
    oldPrice: null,
    stock: 3,
    image: '/images/roses.png',
    images: ['/images/roses.png']
  },
  {
    id: 'p6',
    categoryId: 'flowers',
    title: { uz: 'Букет "Летний луг"', ru: 'Букет "Летний луг"', en: 'Summer Meadow Bouquet' },
    description: {
      uz: 'Yovvoyi gullardan iborat yozgi guldasta.',
      ru: 'Летний букет из полевых ромашек, васильков и диких маков.',
      en: 'A summer bouquet of field daisies, cornflowers, and wild poppies.'
    },
    price: 220000,
    oldPrice: null,
    stock: 4,
    image: '/images/wildflowers.png',
    images: ['/images/wildflowers.png']
  },
  {
    id: 'p7',
    categoryId: 'men',
    title: { uz: 'Мужская рубашка-жакет', ru: 'Мужская рубашка-жакет', en: "Men's Shirt Jacket" },
    description: {
      uz: 'Erkaklar uchun zamonaviy katak naqshli jilet-ko\'ylak. Kundalik kiyish uchun juda qulay.',
      ru: 'Стильная мужская рубашка-жакет в клетку. Отличный вариант для повседневного стиля.',
      en: 'Stylish plaid men\'s shirt-jacket. Great option for casual style.'
    },
    price: 75000,
    oldPrice: null,
    stock: 5,
    image: '/images/shirt.png',
    images: ['/images/shirt.png']
  },
  {
    id: 'p8',
    categoryId: 'women',
    title: { uz: 'Синий вязаный кардиган с воротником', ru: 'Синий вязаный кардиган с воротником', en: 'Blue Knitted Cardigan with Collar' },
    description: {
      uz: 'Trikotaj yoqali va tugmali nafis ayollar ko\'k kardigani. Yumshoq va iliq material.',
      ru: 'Уютный синий вязаный кардиган с широким воротником и узором косы.',
      en: 'Cozy blue knitted cardigan with a wide collar and cable knit pattern.'
    },
    price: 100000,
    oldPrice: 200000,
    stock: 10,
    image: '/images/cardigan.png',
    images: ['/images/cardigan.png']
  },
  {
    id: 'p9',
    categoryId: 'electronics',
    title: { uz: 'Wireless Earbuds Pro', ru: 'Wireless Earbuds Pro', en: 'Wireless Earbuds Pro' },
    description: {
      uz: 'Shovqinni bostiruvchi va yuqori chastotali ovoz beruvchi premium simsiz quloqchinlar.',
      ru: 'Беспроводные наушники с активным шумоподавлением и премиальным звуком.',
      en: 'Premium wireless earbuds with active noise cancellation and high fidelity sound.'
    },
    price: 490000,
    oldPrice: 650000,
    stock: 8,
    image: '/images/headphones.png',
    images: ['/images/headphones.png']
  },
  {
    id: 'p10',
    categoryId: 'men',
    title: { uz: 'Krossovki Asics Gel-1130', ru: 'Кроссовки Asics Gel-1130', en: 'Asics Gel-1130 Sneakers' },
    description: {
      uz: 'Krem va ko\'k rangli zamonaviy hamda yugurish uchun o\'ta qulay krossovkalar. Kundalik kiyish uchun ham mos keladi.',
      ru: 'Удобные и стильные кроссовки Asics в кремово-синем исполнении. Идеальны для бега и на каждый день.',
      en: 'Comfortable and stylish Asics sneakers in cream-blue. Ideal for running and everyday wear.'
    },
    price: 850000,
    oldPrice: 1200000,
    stock: 6,
    image: '/images/sneakers.png',
    images: ['/images/sneakers.png']
  }
];

export const TRANSLATIONS = {
  uz: {
    storeName: 'Dastyor Store',
    searchPlaceholder: 'Mahsulotlarni qidirish...',
    catalog: 'Katalog',
    cart: 'Savat',
    favorites: 'Sevimlilar',
    profile: 'Profil',
    addToCart: 'Savatga qo\'shish',
    inCart: 'savatda',
    totalPrice: 'Jami',
    checkout: 'Rasmiylashtirish',
    promoCode: 'Promokod',
    applyPromo: 'Qo\'llash',
    promoApplied: 'Promokod qo\'llandi!',
    promoError: 'Promokod xato',
    emptyCart: 'Savat bo\'sh',
    emptyCartDesc: 'Katalogdan mahsulotlar qo\'shing',
    emptyFavorites: 'Hozircha bo\'sh',
    emptyFavoritesDesc: 'Yurakchani bosib mahsulotlarni sevimlilarga qo\'shing',
    backToCatalogShort: 'Katalogga',
    deliveryAddress: 'Yetkazib berish manzili',
    enterAddress: 'Toshkent sh., Chilonzor t., 12-uy...',
    phone: 'Telefon raqam',
    paymentMethod: 'To\'lov usuli',
    orderSuccess: 'Buyurtma qabul qilindi! 🎉',
    orderSuccessDesc: 'Operatorimiz tez orada bog\'lanadi.',
    orderSuccessTitle: 'Buyurtma qabul qilindi!',
    orderSuccessStatus: 'Siz bilan bog\'lanishadi',
    orderSuccessDesc2: 'Buyurtma holatini profildan kuzatishingiz mumkin.',
    backToCatalogLong: 'Katalogga qaytish',
    ordersHistory: 'Buyurtmalar tarixi',
    statusProcessing: 'Ko\'rib chiqilmoqda',
    statusShipping: 'Yo\'lda',
    statusDelivered: 'Yetkazildi',
    languageName: 'O\'zbekcha',
    backToCatalog: 'Katalogga qaytish',
    description: 'Tavsif',
    clearCart: 'Tozalash',
    close: 'Yopish',
    confirm: 'Tasdiqlash',
    itemsCount: 'ta'
  },
  ru: {
    storeName: 'Dastyor Store',
    searchPlaceholder: 'Поиск товаров...',
    catalog: 'Каталог',
    cart: 'Корзина',
    favorites: 'Избранное',
    profile: 'Профиль',
    addToCart: 'В корзину',
    inCart: 'в корзине',
    totalPrice: 'Итого',
    checkout: 'Оформить заказ',
    promoCode: 'Промокод',
    applyPromo: 'Применить',
    promoApplied: 'Промокод применен!',
    promoError: 'Неверный промокод',
    emptyCart: 'Корзина пуста',
    emptyCartDesc: 'Добавьте товары из каталога',
    emptyFavorites: 'Пока пусто',
    emptyFavoritesDesc: 'Нажмите на сердечко, чтобы добавить товары в избранное',
    backToCatalogShort: 'В каталог',
    deliveryAddress: 'Адрес доставки',
    enterAddress: 'г. Ташкент, Чиланзарский р-н, д. 12...',
    phone: 'Номер телефона',
    paymentMethod: 'Способ оплаты',
    orderSuccess: 'Заказ принят! 🎉',
    orderSuccessDesc: 'Наш оператор свяжется с вами.',
    orderSuccessTitle: 'Заказ принят!',
    orderSuccessStatus: 'С вами свяжутся',
    orderSuccessDesc2: 'Вы можете отслеживать статус заказа в профиле.',
    backToCatalogLong: 'Вернуться в каталог',
    ordersHistory: 'История заказов',
    statusProcessing: 'В обработке',
    statusShipping: 'В пути',
    statusDelivered: 'Доставлен',
    languageName: 'Русский',
    backToCatalog: 'В каталог',
    description: 'Описание',
    clearCart: 'Очистить',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    itemsCount: 'шт'
  },
  en: {
    storeName: 'Dastyor Store',
    searchPlaceholder: 'Search products...',
    catalog: 'Catalog',
    cart: 'Cart',
    favorites: 'Favorites',
    profile: 'Profile',
    addToCart: 'Add to Cart',
    inCart: 'in cart',
    totalPrice: 'Total',
    checkout: 'Checkout',
    promoCode: 'Promo Code',
    applyPromo: 'Apply',
    promoApplied: 'Promo code applied!',
    promoError: 'Invalid promo code',
    emptyCart: 'Cart is empty',
    emptyCartDesc: 'Add products from the catalog',
    emptyFavorites: 'Empty for now',
    emptyFavoritesDesc: 'Click the ♥ button on products you like to add them here',
    backToCatalogShort: 'To Catalog',
    deliveryAddress: 'Delivery address',
    enterAddress: '12 Seul Str., Chilonzor Dist., Tashkent...',
    phone: 'Phone number',
    paymentMethod: 'Payment method',
    orderSuccess: 'Order placed! 🎉',
    orderSuccessDesc: 'Our operator will contact you shortly.',
    orderSuccessTitle: 'Order received!',
    orderSuccessStatus: 'You will be contacted',
    orderSuccessDesc2: 'You can track your order status in the profile.',
    backToCatalogLong: 'Back to Catalog',
    ordersHistory: 'Orders History',
    statusProcessing: 'Under Review',
    statusShipping: 'In Transit',
    statusDelivered: 'Delivered',
    languageName: 'English',
    backToCatalog: 'Back to Catalog',
    description: 'Description',
    clearCart: 'Clear',
    close: 'Close',
    confirm: 'Confirm',
    itemsCount: 'pcs'
  }
};
