# Between Lines

Koyu lacivert çerçeveli, fotoğraf ağırlıklı kişisel blog arayüzü. React, TypeScript, Vite ve Tailwind CSS ile hazırlanmıştır.

## Geliştirme

```bash
npm install
npm run dev
```

Üretim derlemesini doğrulamak için:

```bash
npm run build
npm run preview
```

## Şu anki özellikler

- Duyarlı blog ana sayfası; kategori filtresi ve yazı araması
- Yazı detayları, hakkımda sayfası ve favorilere ekleme
- Okuma günlüğü: “Currently reading” ve “Last read” kitap rafları, okuma yüzdesi ve bitirme tarihi
- Yerel yönetim önizlemesi: yazı ve kitap ekleme, düzenleme, silme; yazı taslaklarını yönetme ve yayımlama
- Yazılar, kitaplar ve favoriler tarayıcının `localStorage` alanında saklanır

Yönetim paneli şu anda yalnızca yerel önizlemedir; güvenli yönetici girişi veya cihazlar arası senkronizasyon sağlamaz. Üretim kullanımı için Supabase Auth, veritabanı ve Row Level Security bağlanmalıdır. Blog kapak fotoğrafları ve Google Fonts internet bağlantısı gerektirir.

## Cloudflare Pages

Projeyi Pages'e bağlarken build komutu olarak `npm run build`, çıktı klasörü olarak `dist` kullanın. Supabase entegrasyonu eklendiğinde proje ortam değişkenleri Cloudflare Pages ayarlarına da eklenmelidir.
