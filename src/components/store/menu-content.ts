// ── Tabla theme store — sample menu content (bilingual) ─────────────────────
export type Lang = 'en' | 'ar';

export interface Copy {
  name: string; tagline: string; currency: string; search: string;
  viewCart: string; send: string; total: string; add: string; addCart: string;
  chefPick: string; popular: string; spicy: string; vegetarian: string;
  notes: string; notesPh: string; empty: string; menu: string; call: string;
}

export const COPY: Record<Lang, Copy> = {
  en: {
    name: 'Cafe Nour', tagline: 'Levantine kitchen · Cairo', currency: 'EGP',
    search: 'Search the menu…', viewCart: 'View order', send: 'Send via WhatsApp',
    total: 'Total', add: 'Add', addCart: 'Add to order',
    chefPick: 'Chef’s pick', popular: 'Popular', spicy: 'Spicy', vegetarian: 'Veg',
    notes: 'Notes', notesPh: 'No onions, extra spicy…', empty: 'No items here',
    menu: 'Menu', call: 'Call to order',
  },
  ar: {
    name: 'كافيه نور', tagline: 'مطبخ شامي · القاهرة', currency: 'ج.م',
    search: 'ابحث في القائمة…', viewCart: 'عرض الطلب', send: 'إرسال عبر واتساب',
    total: 'الإجمالي', add: 'إضافة', addCart: 'أضف للطلب',
    chefPick: 'اختيار الشيف', popular: 'الأكثر طلباً', spicy: 'حار', vegetarian: 'نباتي',
    notes: 'ملاحظات', notesPh: 'بدون بصل، حار إضافي…', empty: 'لا توجد أصناف',
    menu: 'القائمة', call: 'اتصل للطلب',
  },
};

export interface Category { id: string; name: string }

export const CATS: Record<Lang, ReadonlyArray<Category>> = {
  en: [
    { id: 'feat', name: 'Featured' }, { id: 'mez', name: 'Mezze' },
    { id: 'main', name: 'Mains' }, { id: 'dess', name: 'Desserts' }, { id: 'drk', name: 'Drinks' },
  ],
  ar: [
    { id: 'feat', name: 'مختارات' }, { id: 'mez', name: 'مقبّلات' },
    { id: 'main', name: 'الأطباق الرئيسية' }, { id: 'dess', name: 'حلويات' }, { id: 'drk', name: 'مشروبات' },
  ],
};

export const OFFERS: Record<Lang, ReadonlyArray<string>> = {
  en: ['🍷 Wine night every Tuesday — 20% off bottles', '🎉 Free knafeh with any main today', '🔥 Try our new Aleppo cherry kebab'],
  ar: ['🍷 ليلة النبيذ كل ثلاثاء — خصم ٢٠٪', '🎉 كنافة مجانية مع أي طبق رئيسي اليوم', '🔥 جرّب كباب الكرز الحلبي الجديد'],
};

export type DishTag = 'vegetarian' | 'chefPick' | 'popular' | 'spicy';

export interface DishItem {
  id: number; cat: string; price: number; hue: number; rating: number; votes: number;
  /** Curated Unsplash photo for the live preview (real food imagery). */
  image: string;
  tags: ReadonlyArray<DishTag>;
  en: { name: string; desc: string };
  ar: { name: string; desc: string };
}

/** Build a sized, auto-formatted Unsplash CDN URL from a photo id. */
const photo = (id: string): string => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=70`;

export const ITEMS: ReadonlyArray<DishItem> = [
  { id: 1, cat: 'feat', price: 95, hue: 18, rating: 4.9, votes: 212, image: photo('1482049016688-2d3e1b311543'), tags: ['vegetarian', 'chefPick'],
    en: { name: 'Shakshuka Nour', desc: 'Slow-cooked San Marzano tomatoes, soft eggs, smoked paprika, toasted sourdough.' },
    ar: { name: 'شكشوكة نور', desc: 'طماطم سان مارزانو، بيض طري، بابريكا مدخّنة وخبز محمّص.' } },
  { id: 2, cat: 'feat', price: 180, hue: 30, rating: 4.8, votes: 167, image: photo('1414235077428-338989a2e8c0'), tags: ['popular'],
    en: { name: 'Lamb Mansaf', desc: 'Tender lamb shoulder, fragrant jameed yogurt, toasted almonds, saffron rice.' },
    ar: { name: 'منسف لحم', desc: 'كتف لحم ضأن طريّ، لبن جميد، لوز محمّص وأرز بالزعفران.' } },
  { id: 3, cat: 'mez', price: 55, hue: 45, rating: 4.7, votes: 301, image: photo('1546069901-ba9599a7e63c'), tags: ['vegetarian'],
    en: { name: 'Hummus Beiruti', desc: 'Whipped chickpeas, fresh herbs, garlic confit, green olive oil.' },
    ar: { name: 'حمّص بيروتي', desc: 'حمّص ناعم بالأعشاب الطازجة، ثوم وزيت زيتون أخضر.' } },
  { id: 4, cat: 'mez', price: 60, hue: 5, rating: 4.6, votes: 88, image: photo('1504674900247-0877df9cc836'), tags: ['vegetarian', 'spicy'],
    en: { name: 'Muhammara', desc: 'Charred red peppers, walnuts, pomegranate molasses, Aleppo chili.' },
    ar: { name: 'محمّرة', desc: 'فلفل أحمر مشوي، جوز، دبس رمان وفلفل حلبي.' } },
  { id: 5, cat: 'mez', price: 50, hue: 60, rating: 4.5, votes: 64, image: photo('1473093295043-cdd812d0e601'), tags: ['vegetarian'],
    en: { name: 'Labneh & Za’atar', desc: 'Strained yogurt, za’atar dukkah, cold-pressed olive oil.' },
    ar: { name: 'لبنة وزعتر', desc: 'لبنة مصفّاة مع زعتر دقّة وزيت زيتون.' } },
  { id: 6, cat: 'main', price: 220, hue: 200, rating: 4.9, votes: 143, image: photo('1565299624946-b28f40a0ae38'), tags: ['popular'],
    en: { name: 'Grilled Sea Bass', desc: 'Whole fish over charcoal, lemon-tahini, sumac onions, fennel.' },
    ar: { name: 'قاروص مشوي', desc: 'سمك كامل مشوي على الفحم، طحينة بالليمون وبصل سماق.' } },
  { id: 7, cat: 'main', price: 165, hue: 350, rating: 4.8, votes: 119, image: photo('1551782450-a2132b4ba21d'), tags: ['popular', 'spicy'],
    en: { name: 'Kebab Karaz', desc: 'Aleppo cherry kebab, pine nuts, pomegranate molasses, flatbread.' },
    ar: { name: 'كباب كرز', desc: 'كباب حلبي بالكرز، صنوبر، دبس رمان وخبز مرقوق.' } },
  { id: 8, cat: 'dess', price: 70, hue: 35, rating: 4.9, votes: 256, image: photo('1432139555190-58524dae6a55'), tags: ['popular'],
    en: { name: 'Knafeh', desc: 'Crisp kataifi, melted akkawi cheese, rose-orange blossom syrup.' },
    ar: { name: 'كنافة', desc: 'كنافة مقرمشة، جبن عكاوي ذائب وشراب الورد والزهر.' } },
  { id: 9, cat: 'dess', price: 60, hue: 300, rating: 4.6, votes: 77, image: photo('1551024601-bec78aea704b'), tags: ['vegetarian'],
    en: { name: 'Mhalabieh', desc: 'Silky rosewater milk pudding, candied pistachios, petals.' },
    ar: { name: 'مهلبية', desc: 'مهلبية بماء الورد، فستق محلّى وبتلات ورد.' } },
  { id: 10, cat: 'drk', price: 35, hue: 75, rating: 4.7, votes: 95, image: photo('1559847844-5315695dadae'), tags: ['vegetarian'],
    en: { name: 'Mint Lemonade', desc: 'Hand-pressed lemons, garden mint, orange blossom.' },
    ar: { name: 'ليموناضة بالنعناع', desc: 'ليمون طازج، نعناع وزهر برتقال.' } },
  { id: 11, cat: 'drk', price: 25, hue: 25, rating: 4.8, votes: 130, image: photo('1499636136210-6f4ee915583e'), tags: [],
    en: { name: 'Cardamom Coffee', desc: 'Slow-brewed Arabic coffee with green cardamom.' },
    ar: { name: 'قهوة بالهيل', desc: 'قهوة عربية مع هيل أخضر.' } },
];
