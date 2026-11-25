import Foundation
import Network

/// Yerel `www/` paketini `http://127.0.0.1:<port>` üzerinden sunan hafif yerleşik HTTP sunucusu.
/// Resmi YouTube IFrame Player API'nin geçerli bir HTTP kökeni (origin/referer) almasını ve
/// `localStorage` verilerinin oturumlar arasında kalıcı olmasını sağlar.
final class LocalWebServer: ObservableObject {
    @Published private(set) var baseURL: URL?

    private var listener: NWListener?
    private let queue = DispatchQueue(label: "com.anilityumpar.localserver", qos: .userInitiated)
    private let webRoot: URL?

    init() {
        self.webRoot = Bundle.main.url(forResource: "www", withExtension: nil)
        start(preferredPort: 18421)
    }

    deinit {
        listener?.cancel()
    }

    private func start(preferredPort: UInt16) {
        do {
            let params = NWParameters.tcp
            params.requiredLocalEndpoint = NWEndpoint.hostPort(
                host: .ipv4(.loopback),
                port: NWEndpoint.Port(rawValue: preferredPort) ?? .any
            )
            let newListener = try NWListener(using: params)
            configureAndStart(newListener)
        } catch {
            // Sabit port meşgulse rastgele boş bir yerel porta geç
            do {
                let params = NWParameters.tcp
                params.requiredLocalEndpoint = NWEndpoint.hostPort(host: .ipv4(.loopback), port: .any)
                let fallbackListener = try NWListener(using: params)
                configureAndStart(fallbackListener)
            } catch {
                print("LocalWebServer başlatılamadı: \(error)")
            }
        }
    }

    private func configureAndStart(_ newListener: NWListener) {
        listener = newListener
        newListener.stateUpdateHandler = { [weak self] state in
            if case .ready = state, let port = newListener.port?.rawValue {
                DispatchQueue.main.async {
                    self?.baseURL = URL(string: "http://127.0.0.1:\(port)/index.html")
                }
            }
        }
        newListener.newConnectionHandler = { [weak self] conn in
            self?.handleConnection(conn)
        }
        newListener.start(queue: queue)
    }

    private func handleConnection(_ conn: NWConnection) {
        conn.start(queue: queue)
        conn.receive(minimumIncompleteLength: 1, maximumLength: 16384) { [weak self] data, _, _, _ in
            guard let self, let data, let requestText = String(data: data, encoding: .utf8) else {
                conn.cancel()
                return
            }
            let response = self.buildHTTPResponse(for: requestText)
            conn.send(content: response, completion: .contentProcessed { _ in
                conn.cancel()
            })
        }
    }

    private func buildHTTPResponse(for requestText: String) -> Data {
        guard let root = webRoot else {
            return makeResponse(status: "500 Internal Server Error", contentType: "text/plain", body: Data("www klasoru bulunamadi".utf8))
        }

        let firstLine = requestText.components(separatedBy: "\r\n").first ?? ""
        let parts = firstLine.components(separatedBy: " ")
        var rawPath = parts.count > 1 ? parts[1] : "/index.html"
        if let qIdx = rawPath.firstIndex(of: "?") {
            rawPath = String(rawPath[..<qIdx])
        }
        rawPath = rawPath.removingPercentEncoding ?? rawPath
        if rawPath == "/" || rawPath.isEmpty {
            rawPath = "/index.html"
        }
        while rawPath.hasPrefix("/") {
            rawPath.removeFirst()
        }

        let candidate = root.appendingPathComponent(rawPath).standardizedFileURL
        let rootPath = root.standardizedFileURL.path
        guard candidate.path.hasPrefix(rootPath),
              let fileData = try? Data(contentsOf: candidate) else {
            return makeResponse(status: "404 Not Found", contentType: "text/plain; charset=utf-8", body: Data("Dosya bulunamadi".utf8))
        }

        let mime = mimeType(for: candidate.pathExtension.lowercased())
        return makeResponse(status: "200 OK", contentType: mime, body: fileData)
    }

    private func makeResponse(status: String, contentType: String, body: Data) -> Data {
        let header =
            "HTTP/1.1 \(status)\r\n" +
            "Content-Type: \(contentType)\r\n" +
            "Content-Length: \(body.count)\r\n" +
            "Cache-Control: no-cache\r\n" +
            "Connection: close\r\n\r\n"
        var payload = Data(header.utf8)
        payload.append(body)
        return payload
    }

    private func mimeType(for ext: String) -> String {
        switch ext {
        case "html", "htm": return "text/html; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "js", "mjs": return "application/javascript; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "svg": return "image/svg+xml"
        case "ico": return "image/x-icon"
        case "woff2": return "font/woff2"
        default: return "application/octet-stream"
        }
    }
}
