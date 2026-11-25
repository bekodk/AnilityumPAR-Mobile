# AnilityumPAR Mobile

`AnilityumPAR` tasarım dilinden ilham alan; resmi **YouTube IFrame Player API** & **YouTube Data API v3** destekli, canlı senkronize şarkı sözlü (LRCLIB) ve **çoklu fotoğraftan otomatik çalma listesi oluşturan** mobil müzik uygulaması (PWA + yerel iOS SwiftUI/WKWebView projesi).

## Özellikler

- **AnilityumPAR Koyu Neon Mor & Turkuaz Mobil Arayüz:** iPhone çentik/Dynamic Island güvenli alan desteği, alt sekme çubuğu, mini oynatıcı ve tam ekran "Şu Anda Çalan" paneli.
- **Çoklu Fotoğraftan Şarkı Tarama ve Liste Oluşturma (`Tara` sekmesi):**
  - Tek seferde **1'den fazla fotoğraf** (ekran görüntüsü, liste fotoğrafı vb.) seçme.
  - **Yerleşik OCR (Tesseract.js):** API anahtarı olmadan koyu tema ekran görüntülerini otomatik ters çevirip şarkı adı ve sanatçıyı ayırır.
  - **Gemini AI Görsel Tarama (`gemini-3.8-flash`, isteğe bağlı):** Ayarlar'dan ücretsiz Gemini API anahtarı eklendiğinde çok yüksek doğrulukla şarkı listesi çıkarır.
  - Bulunan şarkıları düzenleme, işaretleme, otomatik arama ile eşleştirip yeni veya mevcut çalma listesine ekleme.
- **Şarkı Arama, Favoriler ve Çalma Listeleri:**
  - **Resmi YouTube Data API v3** ile tam uzunlukta şarkı/klip arama ve **Resmi YouTube IFrame Player** ile oynatma (video klip aç/kapat destekli).
  - Doğrudan **YouTube video veya çalma listesi linki** yapıştırarak açma.
  - API anahtarı girilmeden önce de **iTunes Katalog Önizleme** ile anında arama, favori ve liste testi.
- **Canlı Senkronize Şarkı Sözleri:** LRCLIB üzerinden şarkıyla eşzamanlı akan ve tıklanabilir sözler.
- **Yerel Kitaplık & Yedekleme:** Favoriler, özel çalma listeleri, dinleme geçmişi ve JSON dışa/içe aktarma.

> **Not:** Oynatma, YouTube'un resmi gömülü oynatıcısı (IFrame Player API) üzerinden gerçekleşir; reklam veya abonelik kısıtlamalarını atlatan yetkisiz akış çıkarıcılar içermez.

---

## 1) Hemen Çalıştırma (PC & iPhone Safari / PWA)

1. `Baslat.bat` dosyasına çift tıkla (veya terminalde `python start.py` çalıştır).
2. Terminalde görünen `http://192.168.x.x:8080` adresini aynı Wi-Fi ağındaki iPhone'unda **Safari** ile aç.
3. Safari'de **Paylaş → Ana Ekrana Ekle** diyerek tam ekran mobil uygulama olarak hemen kullanabilirsin.

---

## 2) Otomatik `.ipa` Dosyası Oluşturma (GitHub Actions ile Ücretsiz)

Windows üzerinde doğrudan Xcode çalışmadığı için projede hazır **GitHub Actions macOS derleme akışı** (`.github/workflows/build-ipa.yml`) bulunur:

1. Bu `AnilityumPAR-Mobile` klasörünü yeni bir GitHub reposuna yükle (`main` dalına).
2. GitHub reposunda **Actions** sekmesine gir → **Build iOS IPA** iş akışının bitmesini bekle (~2-3 dakika).
3. İş akışının altındaki **Artifacts** bölümünden **`AnilityumPARMobile-IPA`** (`AnilityumPARMobile-unsigned.ipa`) dosyasını indir.
4. İndirdiğin `.ipa` dosyasını kendi Apple ID'n ile **AltStore**, **SideStore** veya **Sideloadly** kullanarak iPhone'una yükle.

---

## 3) Ücretsiz API Anahtarları (Uygulama İçi Ayarlar)

- **YouTube Data API v3 (Tam uzunlukta YouTube araması için):**
  1. [Google Cloud Console](https://console.cloud.google.com/) → Yeni proje oluştur.
  2. **APIs & Services → Library** → `YouTube Data API v3` etkinleştir.
  3. **Credentials → Create Credentials → API key** ile anahtarı kopyalayıp uygulamanın **Ayarlar** ekranına yapıştır.
- **Gemini API (İsteğe bağlı — Fotoğraftan AI ile ekstra yüksek doğrulukta okuma):**
  1. [Google AI Studio](https://aistudio.google.com/) üzerinden ücretsiz bir API anahtarı oluştur ve **Ayarlar** ekranına yapıştır.
