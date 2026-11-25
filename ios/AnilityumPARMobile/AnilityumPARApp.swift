import AVFoundation
import SwiftUI

@main
struct AnilityumPARApp: App {
    @StateObject private var server = LocalWebServer()

    init() {
        configureAudioSession()
    }

    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.black.ignoresSafeArea()
                if let url = server.baseURL {
                    WebViewContainer(url: url)
                        .ignoresSafeArea()
                } else {
                    VStack(spacing: 12) {
                        ProgressView()
                            .tint(Color(red: 0.66, green: 0.33, blue: 0.97))
                        Text("AnilityumPAR başlatılıyor...")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.8))
                    }
                }
            }
            .preferredColorScheme(.dark)
        }
    }

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.allowAirPlay, .allowBluetoothA2DP])
            try session.setActive(true)
        } catch {
            print("Ses oturumu ayarlanamadı: \(error)")
        }
    }
}
