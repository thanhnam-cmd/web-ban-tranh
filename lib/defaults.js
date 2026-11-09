/** Nội dung mặc định – mọi thứ ở đây đều chỉnh được trong trang quản trị. */

/** Tăng số này khi muốn thay toàn bộ nội dung & sản phẩm trên website đang chạy bằng bản mặc định mới. */
const CONTENT_VERSION = 5;

const BRAND = 'Xưởng Mành tre trúc Hồng Dương';

// Giá tạm tính – hãy sửa lại giá thật trong Quản trị → Sản phẩm
const SIZES = () => [
  { label: '50 × 100 cm', price: 450000, salePrice: 0 },
  { label: '75 × 150 cm', price: 750000, salePrice: 0 },
];

function defaultSite() {
  return {
    brand: {
      name: BRAND,
      shortName: 'Hồng Dương',
      tagline: 'Tinh hoa mành tre Việt',
      logo: '/products/logo.jpg',
      phone: '0903 491 088',
      phone2: '076 820 8222',
      zalo: '0903491088',
      email: '',
      address: 'KCN Vân Lũng, An Khánh, Hoài Đức, Hà Nội',
      facebook: '',
      hours: '',
    },
    theme: { accent: '#4b3328' },
    announcement: { enabled: true, text: 'Vận chuyển toàn quốc · Hotline / Zalo 0903 491 088 – 076 820 8222 · Xưởng sản xuất trực tiếp' },
    music: { enabled: true, label: 'Nhạc xuân', url: '' },
    video: {
      enabled: true,
      eyebrow: 'Video sản phẩm',
      title: 'Cận cảnh mành tre trúc\nHồng Dương',
      subtitle: 'Xem chất liệu nan trúc, màu in UV và cách treo – cuộn mành thực tế từ xưởng.',
      url: '',
      poster: '/products/bst-a.webp',
    },
    hero: {
      slides: [
        {
          image: '/products/phong-02.jpg',
          eyebrow: BRAND,
          title: 'Tinh hoa mộc Việt\nTrọn vị Tết cổ truyền',
          subtitle: 'Mành tre trúc in tranh & lịch Tết – xưởng sản xuất trực tiếp, giao toàn quốc.',
        },
        {
          image: '/products/lich-07.jpg',
          eyebrow: 'Mành Lịch Tài Lộc 2027',
          title: 'Đón xuân\nphát tài',
          subtitle: 'Vừa là bức tranh phong thủy mang lại may mắn, vừa là cuốn lịch xem ngày tháng không thể thiếu mỗi dịp Tết đến xuân về.',
        },
        {
          image: '/products/phong-04.jpg',
          eyebrow: 'Mành in tranh phông trang trí Tết',
          title: 'Không gian Tết\nsum vầy',
          subtitle: 'Tô điểm phòng khách, phòng thờ, nhà hàng, quán cà phê – mang trọn không khí xuân truyền thống vào không gian của bạn.',
        },
      ],
      ctaPrimary: 'Khám phá bộ sưu tập',
      ctaSecondary: 'Chọn mẫu & đặt mua',
    },
    marquee: { items: ['Tinh hoa mành tre Việt', 'Nan trúc tự nhiên', 'In UV sắc nét', 'Nẹp gỗ chắc chắn', 'Vận chuyển toàn quốc', 'Xưởng sản xuất trực tiếp'] },
    intro: {
      eyebrow: 'Về Hồng Dương',
      statement: 'Tinh hoa mành tre Việt – không gian Tết đậm đà bản sắc. Mỗi tấm mành là cuộc gặp gỡ giữa nan trúc mộc mạc và sắc màu ngày xuân.',
      body: 'Xưởng Mành tre trúc Hồng Dương kết hợp mành tre trúc tự nhiên với công nghệ in UV hiện đại, tạo nên những tấm mành tranh trang trí và mành lịch Tết độc đáo – sản xuất trực tiếp tại xưởng ở Hoài Đức, Hà Nội và giao tận nơi trên toàn quốc.',
      image: '/products/lich-03.jpg',
      stats: [
        { value: '2', suffix: '', label: 'Kích thước: 50×100 & 75×150 cm' },
        { value: '100', suffix: '%', label: 'Sản xuất tại xưởng' },
        { value: '63', suffix: '', label: 'Tỉnh thành nhận giao hàng' },
      ],
    },
    collection: {
      eyebrow: 'Sản phẩm',
      title: 'Tất cả mẫu mành',
      subtitle: '',
      allTitle: 'Tất cả mẫu mành',
    },
    collections: [
      {
        category: 'Mành Phông Tết',
        navLabel: 'Mành Phông Tết',
        name: 'Mành In Tranh Phông Trang Trí Tết',
        nameNote: 'Background Tết',
        image: '/products/bst-a.webp',
        title: 'Không gian Tết sum vầy\nTô điểm góc nhà ấm cúng',
        description: 'Dòng sản phẩm chuyên dùng làm phông nền chụp ảnh, trang trí phòng khách, phòng thờ, nhà hàng, quán cà phê hoặc văn phòng. Các chủ đề phong phú như cành đào, hoa mai, hoa sen, phong cảnh sơn thủy hữu tình, mâm ngũ quả và câu đối đỏ, giúp mang trọn không khí xuân truyền thống vào không gian của bạn.',
        highlightsTitle: 'Ý nghĩa / Điểm nhấn',
        highlights: ['Dễ dàng treo, cuộn gọn sau Tết', 'Độ bền cao', 'Tạo điểm nhấn sang trọng và đậm chất hoài niệm'],
        emptyText: 'Các mẫu mành phông Tết đang được cập nhật. Nhắn Zalo để xem ngay những mẫu mới nhất từ xưởng.',
      },
      {
        category: 'Mành Lịch Tết',
        navLabel: 'Mành Lịch Tết',
        name: 'Mành In Tranh Lịch Tết',
        nameNote: 'Lịch treo tường độc đáo',
        image: '/products/bst-b.webp',
        title: 'Mành Lịch Tài Lộc\nĐón xuân phát tài',
        description: 'Sự kết hợp tinh tế giữa tranh nghệ thuật truyền thống và bộ lịch block hoặc lịch 12 tháng tiện dụng in trực tiếp trên nền mành tre. Vừa là bức tranh trang trí phong thủy mang lại may mắn, tài lộc, vừa là cuốn lịch xem ngày tháng không thể thiếu trong mỗi dịp Tết đến xuân về.',
        highlightsTitle: 'Ý nghĩa / Điểm nhấn',
        highlights: ['Thiết kế độc đáo kết hợp giữa truyền thống và hiện đại', 'Thích hợp làm quà tặng ý nghĩa cho đối tác, người thân'],
        emptyText: 'Các mẫu mành lịch đang được cập nhật. Nhắn Zalo để xem mẫu mới nhất.',
      },
    ],
    spaces: {
      eyebrow: 'Gợi ý không gian',
      title: 'Sắc xuân\ncho mọi góc nhà',
      subtitle: 'Mành tranh, mành lịch Tết hợp với phòng khách, phòng thờ, nhà hàng, quán cà phê hay văn phòng – và là món quà Tết ý nghĩa.',
      items: [
        { title: 'Phòng khách', text: 'Một tấm mành lịch trên nền tre mộc giúp phòng khách ấm cúng, rộn ràng sắc xuân mà vẫn tiện xem ngày tháng.', image: '/products/lich-03.jpg' },
        { title: 'Phòng thờ', text: 'Gam đỏ – vàng truyền thống cùng nan trúc tự nhiên mang lại vẻ trang nghiêm, ấm áp cho không gian thờ tự ngày Tết.', image: '/products/lich-06.jpg' },
        { title: 'Nhà hàng – Quán cà phê', text: 'Làm phông nền chụp ảnh check-in ngày Tết, tạo điểm nhấn hoài niệm, đậm bản sắc Việt cho không gian kinh doanh.', image: '/products/lich-08.jpg' },
        { title: 'Văn phòng – Quà tặng', text: 'Mành lịch tài lộc là món quà Tết ý nghĩa, sang trọng dành tặng đối tác, khách hàng và người thân.', image: '/products/lich-05.jpg' },
      ],
    },
    process: {
      eyebrow: 'Chất liệu & quy trình sản xuất',
      title: 'Chỉn chu\ntừ xưởng đến tay bạn',
      steps: [
        { title: 'Nan trúc tự nhiên', text: 'Được chọn lọc kỹ càng, xử lý chống mối mọt, bền đẹp cùng thời gian.', image: '/products/lich-08.jpg' },
        { title: 'Công nghệ in UV sắc nét', text: 'Hình ảnh sống động, màu sắc tươi sáng, không phai màu theo năm tháng.', image: '/products/lich-07.jpg' },
        { title: 'Hoàn thiện tỉ mỉ', text: 'Nẹp gỗ chắc chắn, dây treo gọn gàng, chỉn chu từ xưởng sản xuất trực tiếp đến tay khách hàng.', image: '/products/lich-01.jpg' },
      ],
    },
    features: {
      eyebrow: 'Vì sao chọn Hồng Dương',
      title: 'Đậm đà bản sắc Tết Việt',
      items: [
        { icon: '竹', title: 'Nan trúc tự nhiên', text: 'Chọn lọc kỹ, xử lý chống mối mọt, bền đẹp theo năm tháng.' },
        { icon: '✦', title: 'In UV sắc nét', text: 'Màu sắc tươi sáng, sống động, không phai theo thời gian.' },
        { icon: '⌂', title: 'Xưởng trực tiếp', text: 'Sản xuất và hoàn thiện tại xưởng, giao tận tay khách hàng.' },
        { icon: '🚚', title: 'Vận chuyển toàn quốc', text: 'Đóng gói cẩn thận, giao hàng đến mọi tỉnh thành.' },
      ],
    },
    promo: {
      enabled: true,
      eyebrow: 'Mùa Tết Đinh Mùi 2027',
      title: 'Đặt sớm – nhận hàng kịp Tết',
      text: 'Xưởng sản xuất trực tiếp. Liên hệ hotline / Zalo để được tư vấn mẫu và báo giá khi đặt số lượng làm quà tặng.',
      endDate: '',
    },
    order: {
      eyebrow: 'Đặt hàng',
      title: 'Chọn mẫu & đặt mua',
      subtitle: 'Chọn mẫu, chọn kích thước, để lại thông tin – xưởng sẽ gọi lại xác nhận đơn hàng cho bạn.',
      shippingText: 'Vận chuyển toàn quốc · Xưởng sản xuất trực tiếp · Kích thước 50×100 cm & 75×150 cm',
      successText: 'Cảm ơn bạn! Xưởng Hồng Dương đã nhận được đơn hàng và sẽ liên hệ xác nhận sớm nhất.',
    },
    testimonials: { eyebrow: 'Khách hàng nói gì', title: 'Cảm nhận của khách hàng', items: [] },
    faq: {
      title: 'Câu hỏi thường gặp',
      items: [
        { q: 'Mành có những kích thước nào?', a: 'Hiện xưởng sản xuất hai kích thước: 50 × 100 cm và 75 × 150 cm. Bạn chọn kích thước ngay khi đặt hàng.' },
        { q: 'Xưởng có giao hàng đi tỉnh không?', a: 'Có. Xưởng Hồng Dương vận chuyển toàn quốc.' },
        { q: 'Mành được làm từ chất liệu gì?', a: 'Nan trúc tự nhiên được chọn lọc, xử lý chống mối mọt; hình ảnh in bằng công nghệ UV sắc nét; hoàn thiện với nẹp gỗ và dây treo.' },
        { q: 'Sau Tết cất mành thế nào?', a: 'Mành dễ dàng cuộn gọn. Bạn nên cuộn lại và cất nơi khô ráo để dùng cho những mùa Tết sau.' },
        { q: 'Tôi muốn đặt số lượng làm quà tặng?', a: 'Hãy gọi hoặc nhắn Zalo 0903 491 088 / 076 820 8222 để được tư vấn mẫu và báo giá.' },
      ],
    },
    footer: {
      about: 'Xưởng Mành tre trúc Hồng Dương – tinh hoa mành tre Việt. Mành in tranh trang trí Tết và mành lịch Tết, sản xuất trực tiếp tại xưởng, vận chuyển toàn quốc.',
      copyright: '© 2026 Xưởng Mành tre trúc Hồng Dương.',
    },
    seo: {
      title: 'Xưởng Mành tre trúc Hồng Dương – Mành lịch Tết, mành tranh trang trí Tết',
      description: 'Mành in tranh phông trang trí Tết và mành lịch Tết 2027 trên nền tre trúc tự nhiên, in UV sắc nét. Kích thước 50×100 cm, 75×150 cm. Xưởng tại Hoài Đức, Hà Nội – vận chuyển toàn quốc.',
      ogImage: '/products/lich-07.jpg',
    },
  };
}

const LICH_DESC = 'Mành tre trúc tự nhiên in tranh kết hợp lịch 12 tháng năm 2027 bằng công nghệ UV sắc nét, màu bền không phai. Hoàn thiện nẹp gỗ, dây treo sẵn, dễ treo và cuộn gọn sau Tết. Vừa là tranh trang trí phong thủy, vừa là lịch xem ngày – món quà Tết ý nghĩa cho đối tác và người thân.';

const L = (n, img, name, short, featured, badge = '') => ({
  id: 'lt' + String(n).padStart(2, '0'),
  code: 'LT' + String(n).padStart(2, '0'),
  name,
  category: 'Mành Lịch Tết',
  short,
  description: LICH_DESC,
  images: ['/products/' + img + '.jpg'],
  video: '',
  sizes: SIZES(),
  badge,
  featured,
  visible: true,
  sort: n,
});

const PHONG_DESC = 'Mành tre trúc tự nhiên in tranh bằng công nghệ UV sắc nét, màu bền không phai. Chuyên dùng làm phông nền chụp ảnh Tết, trang trí phòng khách, phòng thờ, nhà hàng, quán cà phê hoặc văn phòng. Dễ dàng treo, cuộn gọn sau Tết, độ bền cao – tạo điểm nhấn sang trọng, đậm chất hoài niệm.';

const PT = (n, name, short, badge = '') => ({
  id: 'pt' + String(n).padStart(2, '0'),
  code: 'PT' + String(n).padStart(2, '0'),
  name,
  category: 'Mành Phông Tết',
  short,
  description: PHONG_DESC,
  images: ['/products/phong-' + String(n).padStart(2, '0') + '.jpg'],
  video: '',
  sizes: SIZES(),
  badge,
  featured: true,
  visible: true,
  sort: n,
});

function phongProducts() {
  return [
    PT(1, 'Mai Trắng Nền Son', 'Cành mai trắng vươn trên nền đỏ son – trang nhã, ấm áp ngày xuân.', 'Phông chụp ảnh'),
    PT(2, 'Tùng Hạc Đào Xuân', 'Đàn hạc trắng bay giữa tùng xanh và hoa đào – trường thọ, an khang.', 'Nổi bật'),
    PT(3, 'Chim Hoa Báo Xuân', 'Đôi chim sắc màu bên cành hoa trắng trên nền đỏ – tin vui ngày Tết.'),
    PT(4, 'Đào Nguyệt Đoàn Viên', 'Vầng trăng tròn ôm cành đào hồng giữa nền đỏ – sum vầy, viên mãn.'),
    PT(5, 'Ngọc Lan Khung Nguyệt', 'Khung tròn xanh ngọc với hoa lan và chim trên nền tre mộc – thanh nhã.'),
    PT(6, 'Bạch Hoa Rủ Xuân', 'Những chùm hoa trắng rủ xuống nền đỏ cam – rộn ràng mà dịu dàng.'),
    PT(7, 'Đào Chim Khung Tròn', 'Cành đào và chim én trong khung tròn trên nền tre – đậm chất hoài niệm.'),
    PT(8, 'Sơn Thủy Hoàng Hôn', 'Núi non mờ sương, mặt trời đỏ và cành đào – sơn thủy hữu tình.'),
  ];
}

function defaultProducts() {
  return [
    ...phongProducts(),
    L(1, 'lich-07', 'Bạch Dương Phú Quý', 'Dê trắng trên nền vàng rực rỡ, mây lành bao quanh – sắc xuân phú quý.', true, 'Đinh Mùi 2027'),
    L(2, 'lich-04', 'Kim Dương Đón Lộc', 'Dê vàng đứng trên mỏm đá giữa nền đỏ son – tượng trưng tài lộc, thăng tiến.', true, 'Nổi bật'),
    L(3, 'lich-01', 'Song Dương Khai Xuân', 'Đôi dê giữa núi mây, chữ “Năm Đinh Mùi” thư pháp – rộn ràng khai xuân.', true),
    L(4, 'lich-06', 'Song Dương Cát Tường', 'Đôi dê họa tiết truyền thống trên nền đỏ đô – may mắn, cát tường.', true),
    L(5, 'lich-02', 'Tùng Dương Vọng Thủy', 'Dê bên gốc tùng cổ thụ, sông núi hữu tình theo lối thủy mặc.', true),
    L(6, 'lich-05', 'Sơn Thủy Đinh Mùi', 'Thác nước, núi non và đàn dê trong nắng xuân – sơn thủy hữu tình.', true),
    L(7, 'lich-08', 'Tùng Dương An Khang', 'Đôi dê dưới tán tùng giữa mây lành – bình an, khang thái.', true),
    L(8, 'lich-03', 'Quê Hương Thanh Bình', 'Dòng sông quê, mái nhà tranh và đàn dê – thanh bình, sum vầy.', true),
  ];
}

module.exports = { defaultSite, defaultProducts, phongProducts, CONTENT_VERSION };
