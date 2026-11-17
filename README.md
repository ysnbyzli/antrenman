# Antrenman

Kişisel antrenman takip uygulaması. Telefonda ana ekrana eklenerek kullanılır, internetsiz çalışır ve bütün veriyi cihazda (`localStorage`) tutar. Sunucu yoktur.

Yayın adresi: https://ysnbyzli.github.io/antrenman/

## Teknoloji

- Next.js (App Router) + React + TypeScript, **statik çıktı** (`output: 'export'`)
- Tailwind CSS v4; renkler `src/app/globals.css` içindeki tema değişkenlerinden gelir
- Çevrimdışı çalışma: derleme sonrası üretilen `sw.js` (bkz. `scripts/`)

## Komutlar

```bash
npm install      # bağımlılıklar
npm run dev      # geliştirme: http://localhost:3000/antrenman
npm test         # hesaplama kurallarının testleri
npm run lint     # ESLint
npm run build    # out/ klasörüne statik site + sw.js
```

`main` dalına gönderilen her değişiklik GitHub Actions ile derlenip GitHub Pages'e yayınlanır.

## Klasörler

| Yol | İçerik |
| --- | --- |
| `src/app` | Sayfalar: ana sayfa, `workout`, `summary`, `history`, `body`, `settings`, `streak`, `exercises`, `ex/[id]` |
| `src/components` | Ortak arayüz parçaları (`ui`, `shell`), madalyalar, takvim, görseller |
| `src/lib/data.ts` | Hareketler ve antrenman planları. Programı değiştirmek için `PLANS` listesini düzenle. |
| `src/lib/domain.ts` | Kurallar: A/B sırası, hafta serisi, ağırlık artırma önerisi, rozetler |
| `src/lib/store.ts` | Durum deposu (`localStorage`, anahtar `fitness-v1`) |
| `src/lib/actions.ts` | Durumu değiştiren bütün işlemler |
| `public/img` | Hareket fotoğrafları |

## Kaynaklar

- Hareket fotoğrafları: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (kamu malı)
- Kas haritası çizimi: [react-body-highlighter](https://github.com/giavinh79/react-body-highlighter) (MIT)
