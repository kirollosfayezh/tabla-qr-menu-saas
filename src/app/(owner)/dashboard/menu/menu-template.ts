// ── Example menu import sheet (CSV, opens in Excel) ─────────────────────────
// 10 categories × 5 items = 50 rows, bilingual (EN + AR), with tags and option
// groups/choices on several items. This same column layout is what the importer
// will read back.
//
// options cell format (no commas, so CSV stays clean):
//   GroupEn~GroupAr~min~max~required :: ChoiceEn/ChoiceAr/+delta | ChoiceEn/ChoiceAr/+delta ; <next group>

export const MENU_TEMPLATE_COLUMNS = [
  'category_en', 'category_ar', 'item_en', 'item_ar',
  'description_en', 'description_ar', 'price_egp', 'tags', 'available', 'options',
] as const;

type Item = [en: string, ar: string, descEn: string, descAr: string, price: number, tags: string, options: string];

const SIZE = 'Size~الحجم~1~1~required :: Small/صغير/+0 | Medium/وسط/+20 | Large/كبير/+40';
const EXTRAS = 'Extras~إضافات~0~3~optional :: Cheese/جبنة/+15 | Mushroom/فطر/+10 | Olives/زيتون/+10';
const DONE = 'Doneness~درجة الاستواء~1~1~required :: Medium/وسط/+0 | Well done/مستوي جيدًا/+0';
const SIDE = 'Side~طبق جانبي~1~1~required :: Fries/بطاطس/+0 | Rice/أرز/+0 | Salad/سلطة/+0';
const SUGAR = 'Sugar~السكر~1~1~required :: No sugar/بدون/+0 | Light/خفيف/+0 | Medium/وسط/+0';
const SODA = 'Type~النوع~1~1~required :: Cola/كولا/+0 | Sprite/سبرايت/+0 | Fanta/فانتا/+0';

const MENU: ReadonlyArray<readonly [catEn: string, catAr: string, items: ReadonlyArray<Item>]> = [
  ['Appetizers', 'المقبلات', [
    ['Hummus', 'حمص', 'Creamy chickpea dip with olive oil', 'حمص كريمي بزيت الزيتون', 45, 'vegetarian', ''],
    ['Baba Ganoush', 'بابا غنوج', 'Smoky grilled eggplant dip', 'باذنجان مشوي مدخّن', 45, 'vegetarian', ''],
    ['Falafel', 'فلافل', 'Crispy fried chickpea patties', 'أقراص حمص مقلية', 35, 'vegetarian|spicy', ''],
    ['Cheese Sambousek', 'سمبوسك جبنة', 'Fried pastry filled with cheese', 'عجينة محشية جبنة', 50, '', ''],
    ['Vine Leaves', 'ورق عنب', 'Stuffed grape leaves with rice', 'ورق عنب محشي أرز', 55, 'vegetarian', ''],
  ]],
  ['Salads', 'السلطات', [
    ['Fattoush', 'فتوش', 'Mixed greens with toasted bread', 'خضار مشكلة مع خبز محمص', 50, 'vegetarian', ''],
    ['Tabbouleh', 'تبولة', 'Parsley, bulgur and tomato', 'بقدونس وبرغل وطماطم', 50, 'vegetarian', ''],
    ['Greek Salad', 'سلطة يونانية', 'Tomato, cucumber and feta', 'طماطم وخيار وجبنة فيتا', 60, 'vegetarian', ''],
    ['Caesar Salad', 'سلطة سيزر', 'Romaine, croutons and parmesan', 'خس وكروتون وبارميزان', 70, '', 'Protein~البروتين~0~1~optional :: Grilled chicken/فراخ مشوية/+25 | Shrimp/جمبري/+45'],
    ['Rocket Salad', 'سلطة جرجير', 'Rocket leaves with parmesan', 'جرجير مع بارميزان', 45, 'vegetarian', ''],
  ]],
  ['Soups', 'الشوربات', [
    ['Lentil Soup', 'شوربة عدس', 'Classic Egyptian lentil soup', 'شوربة عدس مصرية', 35, 'vegetarian', ''],
    ['Chicken Soup', 'شوربة فراخ', 'Hearty chicken broth', 'شوربة فراخ غنية', 40, '', ''],
    ['Mushroom Soup', 'شوربة فطر', 'Creamy mushroom soup', 'شوربة فطر كريمية', 45, 'vegetarian', ''],
    ['Seafood Soup', 'شوربة سيفود', 'Mixed seafood bisque', 'شوربة مأكولات بحرية', 70, '', ''],
    ['Vegetable Soup', 'شوربة خضار', 'Seasonal vegetable soup', 'شوربة خضار موسمية', 35, 'vegetarian', ''],
  ]],
  ['Main Dishes', 'الأطباق الرئيسية', [
    ['Chicken Curry', 'كاري دجاج', 'Chicken in curry sauce with rice', 'دجاج بصلصة الكاري مع أرز', 120, 'spicy', ''],
    ['Beef Stroganoff', 'بيف ستروجانوف', 'Beef strips in cream sauce', 'شرائح لحم بصلصة كريمة', 160, '', ''],
    ['Moussaka', 'مسقعة', 'Baked eggplant with minced meat', 'باذنجان بالفرن مع لحم مفروم', 110, '', ''],
    ['Stuffed Pigeon', 'حمام محشي', 'Pigeon stuffed with freekeh', 'حمام محشي فريك', 180, '', ''],
    ['Okra Stew', 'بامية', 'Okra in tomato sauce with meat', 'بامية بصلصة الطماطم مع لحم', 95, '', ''],
  ]],
  ['Grills', 'المشاوي', [
    ['Mixed Grill', 'مشاوي مشكلة', 'Assorted grilled meats', 'تشكيلة لحوم مشوية', 220, '', `${DONE} ; ${SIDE}`],
    ['Shish Tawook', 'شيش طاووق', 'Marinated grilled chicken skewers', 'أسياخ دجاج متبلة', 130, '', SIDE],
    ['Kofta', 'كفتة', 'Grilled minced meat skewers', 'أسياخ لحم مفروم', 140, 'spicy', SIDE],
    ['Lamb Chops', 'ريش ضاني', 'Grilled lamb chops', 'ريش ضاني مشوية', 240, '', `${DONE} ; ${SIDE}`],
    ['Grilled Chicken', 'فراخ مشوية', 'Half grilled chicken', 'نصف فرخة مشوية', 120, '', SIDE],
  ]],
  ['Pasta', 'المكرونة', [
    ['Spaghetti Bolognese', 'سباجيتي بولونيز', 'Spaghetti with meat sauce', 'سباجيتي بصلصة اللحم', 95, '', ''],
    ['Penne Alfredo', 'بيني الفريدو', 'Penne in creamy alfredo', 'بيني بصلصة الفريدو', 90, 'vegetarian', 'Protein~البروتين~0~1~optional :: Chicken/فراخ/+25 | Shrimp/جمبري/+45'],
    ['Lasagna', 'لازانيا', 'Layered pasta with meat', 'لازانيا باللحم', 110, '', ''],
    ['Seafood Pasta', 'مكرونة سيفود', 'Pasta with mixed seafood', 'مكرونة بالمأكولات البحرية', 140, '', ''],
    ['Mac & Cheese', 'مكرونة بالجبنة', 'Baked macaroni and cheese', 'مكرونة بالجبنة بالفرن', 80, 'vegetarian', ''],
  ]],
  ['Pizza', 'البيتزا', [
    ['Margherita', 'مارجريتا', 'Tomato, mozzarella and basil', 'طماطم وموتزاريلا وريحان', 90, 'vegetarian', `${SIZE} ; ${EXTRAS}`],
    ['Pepperoni', 'بيبروني', 'Pepperoni and cheese', 'بيبروني وجبنة', 110, '', `${SIZE} ; ${EXTRAS}`],
    ['Chicken Ranch', 'تشيكن رانش', 'Chicken with ranch sauce', 'دجاج بصلصة الرانش', 120, '', `${SIZE} ; ${EXTRAS}`],
    ['Veggie', 'خضار', 'Mixed vegetable pizza', 'بيتزا خضار', 95, 'vegetarian', `${SIZE} ; ${EXTRAS}`],
    ['Four Cheese', 'أربع أجبان', 'Blend of four cheeses', 'خليط أربع أجبان', 125, 'vegetarian', `${SIZE} ; ${EXTRAS}`],
  ]],
  ['Desserts', 'الحلويات', [
    ['Om Ali', 'أم علي', 'Warm bread pudding with nuts', 'أم علي بالمكسرات', 55, 'vegetarian', ''],
    ['Konafa', 'كنافة', 'Crispy kunafa with cream', 'كنافة بالقشطة', 60, 'vegetarian', ''],
    ['Cheesecake', 'تشيز كيك', 'New York style cheesecake', 'تشيز كيك نيويورك', 70, 'vegetarian', ''],
    ['Basbousa', 'بسبوسة', 'Semolina cake in syrup', 'بسبوسة بالشربات', 45, 'vegetarian', ''],
    ['Chocolate Cake', 'كيكة شوكولاتة', 'Rich chocolate layer cake', 'كيكة شوكولاتة غنية', 65, 'vegetarian', ''],
  ]],
  ['Hot Drinks', 'المشروبات الساخنة', [
    ['Turkish Coffee', 'قهوة تركي', 'Traditional Turkish coffee', 'قهوة تركي تقليدية', 25, '', SUGAR],
    ['Tea', 'شاي', 'Black or green tea', 'شاي أحمر أو أخضر', 15, '', SUGAR],
    ['Cappuccino', 'كابتشينو', 'Espresso with steamed milk', 'إسبريسو مع حليب', 40, '', ''],
    ['Hot Chocolate', 'شوكولاتة ساخنة', 'Creamy hot chocolate', 'شوكولاتة ساخنة كريمية', 45, 'vegetarian', ''],
    ['Sahlab', 'سحلب', 'Warm milk drink with nuts', 'سحلب بالمكسرات', 40, 'vegetarian', ''],
  ]],
  ['Cold Drinks', 'المشروبات الباردة', [
    ['Mango Juice', 'عصير مانجو', 'Fresh mango juice', 'عصير مانجو طازج', 40, 'vegetarian', ''],
    ['Lemon Mint', 'ليمون نعناع', 'Lemonade with fresh mint', 'ليمون بالنعناع', 35, 'vegetarian', ''],
    ['Iced Coffee', 'قهوة مثلجة', 'Cold brew over ice', 'قهوة باردة بالثلج', 45, '', ''],
    ['Soft Drink', 'مشروب غازي', 'Choose your soda', 'اختر المشروب الغازي', 20, '', SODA],
    ['Water', 'مياه', 'Bottled mineral water', 'مياه معدنية', 10, '', ''],
  ]],
];

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/** Build the example import sheet as a UTF-8 CSV string (BOM included for Excel + Arabic). */
export function buildMenuTemplateCsv(): string {
  const rows: string[] = [MENU_TEMPLATE_COLUMNS.map(csvCell).join(',')];
  for (const [catEn, catAr, items] of MENU) {
    for (const [en, ar, descEn, descAr, price, tags, options] of items) {
      rows.push([catEn, catAr, en, ar, descEn, descAr, price, tags, 'yes', options].map(csvCell).join(','));
    }
  }
  return `﻿${rows.join('\r\n')}\r\n`;
}
