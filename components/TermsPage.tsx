import React from 'react';

interface TermsPageProps {
  onClose: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">🎆 Firework Zen</h1>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* About Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <p className="text-white/80 leading-relaxed">
              Fun fireworks for my children and anyone else to enjoy; sometimes we need that little spark to help us unwind. 
              Firework Zen is a relaxing, creative experience designed to bring joy and peace through beautiful digital fireworks displays.
            </p>
          </section>

          {/* Privacy Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
            <div className="text-white/80 leading-relaxed space-y-3">
              <p>
                <strong>Data Collection:</strong> This app does not collect, store, or transmit any personal information. 
                All interactions happen locally in your browser.
              </p>
              <p>
                <strong>Local Storage:</strong> We may store your game preferences (like volume settings) locally on your device 
                to improve your experience. This data never leaves your device.
              </p>
              <p>
                <strong>Third-Party Services:</strong> This app may display advertisements through AdJuice. 
                Please refer to their privacy policy for information about ad-related data collection.
              </p>
              <p>
                <strong>No Tracking:</strong> We do not use cookies, analytics, or any tracking technologies.
              </p>
            </div>
          </section>

          {/* Acceptable Use Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Acceptable Use</h2>
            <div className="text-white/80 leading-relaxed space-y-3">
              <p>
                <strong>Intended Use:</strong> This app is designed for entertainment and relaxation purposes. 
                Please use it responsibly and in appropriate settings.
              </p>
              <p>
                <strong>Age Appropriateness:</strong> While suitable for all ages, parental supervision is recommended 
                for young children due to flashing lights and sounds.
              </p>
              <p>
                <strong>Accessibility:</strong> If you have photosensitivity or hearing sensitivity, please adjust 
                the volume and brightness settings or discontinue use if needed.
              </p>
              <p>
                <strong>Respectful Use:</strong> Please use this app in a way that doesn't disturb others, 
                especially in quiet environments or around people who may be sensitive to flashing lights or sounds.
              </p>
            </div>
          </section>

          {/* Health & Safety Warning */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">⚠️ Health & Safety Notice</h2>
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-100 leading-relaxed space-y-2">
                <p>
                  <strong>Flashing Lights Warning:</strong> This app contains bright, flashing lights that may trigger 
                  seizures in people with photosensitive epilepsy or other light sensitivity conditions.
                </p>
                <p>
                  <strong>Sound Warning:</strong> The app includes audio effects that may be loud. 
                  Please adjust volume appropriately and use headphones in quiet environments.
                </p>
                <p>
                  <strong>If you experience:</strong> dizziness, nausea, eye strain, or any discomfort while using this app, 
                  please stop using it immediately and consult a healthcare professional if symptoms persist.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
            <p className="text-white/80 leading-relaxed">
              If you have any questions about these terms or the app, please contact us through the appropriate channels.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-white/60 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-white/60 text-sm mt-2">
              © 2025 Firework Zen. Made with ❤️ for relaxation and joy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
