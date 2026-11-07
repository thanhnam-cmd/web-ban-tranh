/** Nội dung mặc định – mọi thứ ở đây đều chỉnh được trong trang quản trị. */

const sizes = (a, b, c) => [
  { label: '40 × 50 cm', price: a[0], salePrice: a[1] },
  { label: '60 × 75 cm', price: b[0], salePrice: b[1] },
  { label: '80 × 100 cm', price: c[0], salePrice: c[1] },
];
const STD = () => sizes([690000, 450000], [1190000, 790000], [1890000, 1290000]);
const PREMIUM = () => sizes([890000, 590000], [1490000, 990000], [2390000, 1590000]);

function defaultSite() {
  return {
    brand: {
      name: 'Mộc Họa',
      tagline: 'Tranh nghệ thuật cho không gian sống',
      logo: '',
      phone: '0909 123 456',
      zalo: '0909123456',
      email: 'hello@mochoa.vn',
      address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      facebook: 'https://facebook.com/',
      hours: '8:00 – 21:00, tất cả các ngày',
    },
    theme: { accent: '#c4553a' },
    announcement: { enabled: true, text: 'Miễn phí vận chuyển toàn quốc · Bảo hành khung tranh 24 tháng · Đổi mẫu trong 7 ngày' },
    hero: {
      slides: [
        {
          image: '/samples/hero-01.svg',
          eyebrow: 'Bộ sưu tập Xuân 2027',
          title: 'Mỗi bức tranh\nmột khoảng lặng',
          subtitle: 'Tranh canvas nghệ thuật in UV sắc nét, căng khung gỗ thông thủ công – mang thiên nhiên và cảm xúc vào ngôi nhà của bạn.',
        },
        {
          image: '/samples/hero-02.svg',
          eyebrow: 'Liên Hoa Tĩnh Tâm',
          title: 'Sắc sen\nđón an lành',
          subtitle: 'Dòng tranh hoa sen phong thủy cho phòng khách, phòng thờ và không gian thiền – thanh tao, ấm áp.',
        },
        {
          image: '/samples/hero-03.svg',
          eyebrow: 'Phong cảnh Việt',
          title: 'Mùa vàng\ntrên ruộng bậc thang',
          subtitle: 'Những dải màu mềm mại của núi rừng Tây Bắc, được chuyển thể thành tác phẩm trang trí hiện đại.',
        },
      ],
      ctaPrimary: 'Khám phá bộ sưu tập',
      ctaSecondary: 'Đặt hàng nhanh',
    },
    marquee: { items: ['Canvas cao cấp', 'In UV sắc nét', 'Khung gỗ thông', 'Miễn phí giao hàng', 'Bảo hành 24 tháng', 'Đổi mẫu 7 ngày'] },
    intro: {
      eyebrow: 'Về Mộc Họa',
      statement: 'Chúng tôi tin rằng một bức tranh đẹp không chỉ để treo lên tường – nó là cách ngôi nhà kể câu chuyện của chính bạn.',
      body: 'Từ phác thảo đến khi tác phẩm hoàn thiện, mỗi bức tranh đều đi qua bàn tay của người thợ: chọn vải canvas, in UV, phủ bóng bảo vệ, căng khung gỗ và kiểm tra từng góc cạnh trước khi đến tay bạn.',
      image: '/samples/art-11.svg',
      stats: [
        { value: '12000', suffix: '+', label: 'Khách hàng tin chọn' },
        { value: '350', suffix: '+', label: 'Mẫu tranh độc quyền' },
        { value: '24', suffix: ' th', label: 'Bảo hành khung tranh' },
      ],
    },
    collection: {
      eyebrow: 'Tác phẩm nổi bật',
      title: 'Bộ sưu tập\nđược yêu thích',
      subtitle: 'Kéo để khám phá – chạm vào tác phẩm để xem lớn, chọn kích thước và đặt hàng ngay.',
      allTitle: 'Tất cả tác phẩm',
    },
    spaces: {
      eyebrow: 'Gợi ý không gian',
      title: 'Tranh đúng chỗ,\nnhà thêm hồn',
      subtitle: 'Mỗi không gian có một nhịp điệu riêng. Tham khảo cách phối tranh cho từng góc trong ngôi nhà.',
      items: [
        { title: 'Phòng khách', text: 'Một tác phẩm khổ lớn phía trên sofa tạo điểm nhấn trung tâm, giúp căn phòng trở nên ấm cúng và có chiều sâu.', image: '/samples/room-01.svg' },
        { title: 'Phòng ngủ', text: 'Gam màu dịu, bố cục tối giản giúp không gian nghỉ ngơi thư thái, nhẹ nhàng hơn mỗi sáng thức dậy.', image: '/samples/room-02.svg' },
        { title: 'Phòng làm việc', text: 'Tranh phong cảnh mở ra một "khung cửa sổ" thiên nhiên – giảm căng thẳng, tăng cảm hứng sáng tạo.', image: '/samples/room-03.svg' },
        { title: 'Phòng trà – Thiền', text: 'Tranh sen, tranh thủy mặc mang lại khoảng lặng thanh tịnh cho những phút giây thưởng trà.', image: '/samples/room-04.svg' },
      ],
    },
    process: {
      eyebrow: 'Từ xưởng đến ngôi nhà',
      title: 'Chỉn chu trong\ntừng chi tiết',
      steps: [
        { title: 'Chất liệu canvas', text: 'Vải canvas cotton pha poly định lượng cao, bề mặt vân mịn giữ màu bền đẹp theo thời gian.', image: '/samples/art-07.svg' },
        { title: 'In UV sắc nét', text: 'Công nghệ in UV 8 màu tái hiện chính xác từng sắc độ, chống phai và chống ẩm.', image: '/samples/art-05.svg' },
        { title: 'Căng khung thủ công', text: 'Khung gỗ thông sấy khô, căng tay từng góc, phủ lớp bóng bảo vệ bề mặt tranh.', image: '/samples/art-10.svg' },
        { title: 'Đóng gói & giao hàng', text: 'Bọc góc, chèn xốp nhiều lớp, giao tận nơi toàn quốc – kiểm tra hàng trước khi thanh toán.', image: '/samples/art-01.svg' },
      ],
    },
    features: {
      eyebrow: 'Vì sao chọn chúng tôi',
      title: 'Vẻ đẹp bền lâu',
      items: [
        { icon: '✦', title: 'Thiết kế độc quyền', text: 'Đội ngũ họa sĩ sáng tác riêng, không đụng hàng thị trường.' },
        { icon: '❀', title: 'Chất liệu cao cấp', text: 'Canvas nhập khẩu, mực UV an toàn, khung gỗ thông tự nhiên.' },
        { icon: '⌂', title: 'Tư vấn tận tâm', text: 'Gửi ảnh không gian, chúng tôi phối mẫu & kích thước miễn phí.' },
        { icon: '↻', title: 'Đổi trả dễ dàng', text: 'Đổi mẫu trong 7 ngày, bảo hành khung tranh 24 tháng.' },
      ],
    },
    promo: {
      enabled: true,
      eyebrow: 'Ưu đãi có hạn',
      title: 'Giảm đến 35% toàn bộ sưu tập',
      text: 'Đặt hàng trong thời gian chương trình để nhận giá ưu đãi và quà tặng đinh treo không cần khoan.',
      endDate: '',
    },
    order: {
      eyebrow: 'Đặt hàng',
      title: 'Đặt tranh chỉ trong 1 phút',
      subtitle: 'Chọn mẫu, chọn kích thước, để lại thông tin – chúng tôi sẽ gọi xác nhận trong 15 phút (giờ hành chính).',
      shippingText: 'Miễn phí vận chuyển toàn quốc · Kiểm tra hàng trước khi thanh toán',
      successText: 'Cảm ơn bạn! Chúng tôi đã nhận được đơn hàng và sẽ liên hệ xác nhận sớm nhất.',
    },
    testimonials: {
      eyebrow: 'Khách hàng nói gì',
      title: 'Những ngôi nhà đã có tranh',
      items: [
        { name: 'Chị Minh Anh', role: 'Hà Nội', text: 'Tranh ngoài đời đẹp hơn ảnh, màu rất trong. Khung chắc, đóng gói cẩn thận. Phòng khách nhà mình thay đổi hẳn.', rating: 5 },
        { name: 'Anh Quốc Bảo', role: 'TP. Hồ Chí Minh', text: 'Được tư vấn kích thước rất kỹ theo ảnh tường nhà. Giao nhanh, treo lên là ưng ngay.', rating: 5 },
        { name: 'Chị Thu Hà', role: 'Đà Nẵng', text: 'Mua bộ tranh sen cho phòng thờ, rất thanh tao. Sẽ ủng hộ shop tiếp cho nhà mới.', rating: 5 },
        { name: 'Anh Hoàng Long', role: 'Cần Thơ', text: 'Giá hợp lý so với chất lượng. Mực in sắc nét, nhìn gần vẫn thấy vân canvas rất đẹp.', rating: 5 },
      ],
    },
    faq: {
      title: 'Câu hỏi thường gặp',
      items: [
        { q: 'Bao lâu thì tôi nhận được tranh?', a: 'Tranh có sẵn giao trong 1–2 ngày tại nội thành, 2–5 ngày với các tỉnh khác. Tranh làm theo yêu cầu cần thêm 2–3 ngày sản xuất.' },
        { q: 'Tôi có được kiểm tra hàng trước khi thanh toán?', a: 'Có. Bạn được mở hộp kiểm tra tranh trước khi thanh toán cho nhân viên giao hàng (COD).' },
        { q: 'Có làm kích thước theo yêu cầu không?', a: 'Có. Hãy ghi kích thước mong muốn vào phần ghi chú hoặc nhắn Zalo, chúng tôi sẽ báo giá ngay.' },
        { q: 'Tranh có kèm đinh treo không?', a: 'Mỗi bức tranh đều kèm bộ đinh treo chuyên dụng, không cần khoan tường với khổ dưới 80 × 100 cm.' },
      ],
    },
    footer: {
      about: 'Mộc Họa – xưởng tranh canvas nghệ thuật. Chúng tôi mang những tác phẩm đẹp, bền và vừa túi tiền đến mọi ngôi nhà Việt.',
      copyright: '© 2026 Mộc Họa. Bảo lưu mọi quyền.',
    },
    seo: {
      title: 'Mộc Họa – Tranh canvas nghệ thuật hiện đại',
      description: 'Tranh canvas nghệ thuật, tranh phong cảnh, tranh sen phong thủy, tranh trừu tượng hiện đại. In UV sắc nét, khung gỗ thông, miễn phí giao hàng toàn quốc.',
      ogImage: '/samples/hero-01.svg',
    },
  };
}

const P = (n, code, name, category, short, featured, badge, sizesFn = STD) => ({
  id: 'p' + String(n).padStart(2, '0'),
  code,
  name,
  category,
  short,
  description:
    'Tranh canvas in UV trên vải cotton cao cấp, căng khung gỗ thông sấy khô, phủ bóng bảo vệ chống ẩm – chống phai màu. Sản phẩm kèm đinh treo chuyên dụng, đóng gói chống va đập và giao miễn phí toàn quốc.',
  images: ['/samples/art-' + String(n).padStart(2, '0') + '.svg'],
  video: '',
  sizes: sizesFn(),
  badge,
  featured,
  visible: true,
  sort: n,
});

function defaultProducts() {
  return [
    P(1, 'MH01', 'Bình Minh Trên Núi', 'Phong cảnh', 'Những lớp núi chồng lên nhau trong ánh hoàng hôn ấm áp.', true, 'Bán chạy'),
    P(2, 'MH02', 'Sắc Màu Tĩnh Lặng', 'Trừu tượng', 'Các mảng màu mềm hòa vào nhau, tĩnh tại và sâu lắng.', true, ''),
    P(3, 'MH03', 'Cầu Vồng Đất', 'Tối giản', 'Những vòng cung đất nung mang hơi thở boho hiện đại.', true, 'Mới'),
    P(4, 'MH04', 'Sóng Đêm', 'Trừu tượng', 'Nhịp sóng bạc dưới ánh trăng, chuyển động không ngừng.', false, ''),
    P(5, 'MH05', 'Liên Hoa Tĩnh Tâm', 'Phong thủy', 'Đóa sen nở giữa nền thẫm – biểu tượng của sự thanh tịnh.', true, 'Phong thủy', PREMIUM),
    P(6, 'MH06', 'Lá Nhiệt Đới', 'Tối giản', 'Những tán lá xanh mát cho góc nhà thêm sức sống.', false, ''),
    P(7, 'MH07', 'Dòng Chảy Hoàng Kim', 'Trừu tượng', 'Đường nét ánh kim uốn lượn trên nền xanh đêm sang trọng.', true, 'Cao cấp', PREMIUM),
    P(8, 'MH08', 'Trăng Trên Hồ', 'Phong cảnh', 'Vầng trăng tròn soi bóng mặt hồ, lau sậy lay động.', false, ''),
    P(9, 'MH09', 'Nhịp Điệu Hình Khối', 'Tối giản', 'Hình khối Bauhaus với bảng màu trầm ấm, hiện đại.', false, 'Mới'),
    P(10, 'MH10', 'Rừng Trúc An Yên', 'Phong thủy', 'Rừng trúc xanh vươn thẳng – biểu tượng của sự kiên định.', true, ''),
    P(11, 'MH11', 'Sơn Thủy Mặc', 'Phong thủy', 'Núi non ẩn hiện trong sương theo lối thủy mặc Á Đông.', false, '', PREMIUM),
    P(12, 'MH12', 'Ruộng Bậc Thang Mùa Vàng', 'Phong cảnh', 'Những thửa ruộng uốn lượn óng ả sắc lúa chín.', true, 'Bán chạy'),
  ];
}

module.exports = { defaultSite, defaultProducts };
