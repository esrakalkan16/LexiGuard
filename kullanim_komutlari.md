# Monorepo Kullanım Komutları

Bu proje bir Lerna monorepo'sudur ve `packages/` dizini altında backend, web ve mobil uygulamalarını barındırır. Projenin ana katmanlarını ayağa kaldırmak için çeşitli terminal sekmelerine ihtiyacınız olacak.

## 1. Backend (API) Başlatma
Verilerin sunulduğu ana sunucuyu çalıştırmak için:

```bash
cd packages/backend
npm start
```
*Geliştirme sunucusu `http://localhost:3000` adresinde çalışmaya başlayacaktır.*

## 2. Web Geliştirme Ortamını (Vite + React) Başlatma
Hazırladığımız web arayüzünü tarayıcıda görmek için ayrı bir terminalde:

```bash
cd packages/web
npm run dev
```
*Bu komut size yerel bir link (örn: `http://localhost:5173`) verecektir. Linke tıklayıp web arayüzünü görebilirsiniz.*

## 3. Mobil Ortamı (React Native) Başlatma
Mobil uygulamayı emülatörde veya gerçek cihazda test edebilmek için ayrı bir terminalde:

**Android İçin:**
```bash
cd packages/mobile
npm run android
```

**iOS İçin (Sadece Mac ortamlarında çalışır):**
```bash
cd packages/mobile
npm run ios
```

## 4. Hepsini Aynı Anda Çalıştırma (Tek Komutla)
Lerna sayesinde tüm paketleri (web, backend ve mobil) tek bir terminal üzerinden aynı anda başlatabilirsiniz. Bunu yapmak için projenin **en dış dizininde** (`fullstackProject` klasöründe) şu komutları kullanabilirsiniz:

**Android testleri dahil tüm projeleri başlatmak için:**
```bash
npm run dev
```

**iOS testleri dahil tüm projeleri başlatmak için:**
```bash
npm run dev:ios
```
*(Bu komutlar; web için Vite'ı, backend için Node sunucusunu ve mobile için ilgili Native başlatıcıyı otomatik olarak tetikler.)*

---

> **Notlar:**
> - Projeyi başka bir cihaza kopyaladığınızda sadece en dış klasörde (`fullstackProject` içerisinde) bir kez `npm install` demeniz tüm projelerin (web, mobile, backend) kütüphanelerini kurmak ve birbirine bağlamak için yeterlidir. Lerna bu işlemi otomatik tanır.
> - Hepsini aynı anda (`npm run dev`) çalıştırdığınızda terminalde tüm loglar her bir proje için kendi prefix'i (örn: `web:`, `backend:`) ile renklendirerek akacaktır.
