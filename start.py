"""
AnilityumPAR Mobile — Yerel Sunucu Başlatıcı
Bilgisayardan veya aynı Wi-Fi ağındaki iPhone/Android tarayıcısından
uygulamayı anında açmak için hafif HTTP sunucusu başlatır.
"""
import functools
import http.server
import os
import socket
import socketserver
import webbrowser

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))
WWW_DIR = os.path.join(ROOT, "www")


def get_local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def main():
    os.chdir(WWW_DIR)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=WWW_DIR)
    local_ip = get_local_ip()

    with ReusableTCPServer(("0.0.0.0", PORT), handler) as httpd:
        local_url = f"http://127.0.0.1:{PORT}"
        lan_url = f"http://{local_ip}:{PORT}"
        print("=" * 56)
        print("  AnilityumPAR Mobile Başlatıldı!")
        print(f"  Bilgisayar : {local_url}")
        print(f"  Telefon    : {lan_url}  (Aynı Wi-Fi)")
        print("  iPhone'da Safari > Paylaş > 'Ana Ekrana Ekle' ile")
        print("  tam ekran uygulama olarak da kullanabilirsin.")
        print("  Kapatmak için Ctrl+C tuşlarına bas.")
        print("=" * 56)
        try:
            webbrowser.open(local_url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu kapatıldı.")


if __name__ == "__main__":
    main()
