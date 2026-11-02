# Between Lines

Koyu lacivert çerçeveli, fotoğraf ağırlıklı kişisel blog arayüzü. React, TypeScript, Vite ve Tailwind CSS ile hazırlanmıştır.

## Geliştirme

```bash
npm install
npm run dev
```

Yerel Supabase bağlantısı için `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase proje URL'si ile publishable key'i ekleyin. `.env.local` Git'e gönderilmez. Cloudflare Workers Builds kullanırken aynı `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` değerlerini Worker'ın **Settings → Builds → Build variables and secrets** bölümüne ekleyin.

Üretim derlemesini doğrulamak için:

```bash
npm run build
npm run preview
```

## Şu anki özellikler

- Duyarlı blog ana sayfası; kategori filtresi ve yazı araması
- Yazı detayları, hakkımda sayfası ve favorilere ekleme
- Okuma günlüğü: “Currently reading” ve “Last read” kitap rafları, okuma yüzdesi ve bitirme tarihi
- Başlangıç okuma rafı: José Saramago'nun *Körlük* kitabı ve Han Kang'ın *Vejetaryen* kitabı
- Yerel yönetim önizlemesi: yazı ve kitap ekleme, düzenleme, silme; yazı taslaklarını yönetme ve yayımlama
- Yazılar, kitaplar ve favoriler tarayıcının `localStorage` alanında saklanır
- Supabase yapılandırıldığında yayımlanmış yazılar ve kitaplık herkese açık olarak veritabanından okunur

Yönetim paneli şu anda yalnızca yerel önizlemedir; güvenli yönetici girişi veya cihazlar arası senkronizasyon sağlamaz. Üretim kullanımı için Supabase Auth, veritabanı ve Row Level Security bağlanmalıdır. Blog kapak fotoğrafları ve Google Fonts internet bağlantısı gerektirir.

## Cloudflare Pages

Projeyi Pages'e bağlarken build komutu olarak `npm run build`, çıktı klasörü olarak `dist` kullanın. Supabase entegrasyonu eklendiğinde proje ortam değişkenleri Cloudflare Pages ayarlarına da eklenmelidir.
