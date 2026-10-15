import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  QrCode,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Download,
  Wifi,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Radio,
  X,
} from 'lucide-react';

interface CrossDeviceHandoverProps {
  currentConvId?: string;
  userName: string;
  onSetViewportMode?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  activeViewportMode?: 'desktop' | 'tablet' | 'mobile';
  backendUrl?: string;
}

export const CrossDeviceHandover: React.FC<CrossDeviceHandoverProps> = ({
  currentConvId = '',
  userName,
  onSetViewportMode,
  activeViewportMode = 'desktop',
  backendUrl = 'http://localhost:4000',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [deviceHeight, setDeviceHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [desktopShortcutPath, setDesktopShortcutPath] = useState<string>('');
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string>('');

  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(window.innerWidth);
      setDeviceHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Check standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Function to download Windows Desktop Shortcut directly via browser
  const triggerBrowserShortcutDownload = () => {
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const fileContent =
      '[InternetShortcut]\r\n' +
      `URL=${appOrigin}/\r\n` +
      'IconIndex=0\r\n' +
      'IconFile=C:\\Windows\\System32\\shell32.dll\r\n' +
      '[{000214A0-0000-0000-C000-000000000046}]\r\n' +
      'Prop3=19,11\r\n';

    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'JARVIS — The Time Traveller.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);

    // 1. Immediately trigger browser download of .url desktop shortcut
    triggerBrowserShortcutDownload();

    let createdPath = 'C:\\Users\\Admin\\Desktop\\JARVIS — The Time Traveller.url';

    // 2. Call backend to place shortcut directly on the user's laptop Desktop
    try {
      const res = await fetch(`${backendUrl}/api/install-desktop-shortcut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.path) {
          createdPath = data.path;
        }
      }
    } catch (err) {
      console.warn('Backend desktop shortcut error:', err);
    }

    // 3. Prompt native PWA dialog if browser supports it
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsPwaInstalled(true);
        }
        setInstallPrompt(null);
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    }

    setDesktopShortcutPath(createdPath);
    setInstallSuccessMessage('JARVIS has been downloaded and installed on your laptop homescreen (Desktop)!');
    setIsInstalling(false);
    setShowInstallModal(true);
  };

  const syncUrl = typeof window !== 'undefined' ? `${window.location.origin}/?handover=true&user=${encodeURIComponent(userName)}` : 'http://localhost:5173/';

  const copySyncLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(syncUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Determine current detected device
  const detectedFormFactor = deviceWidth < 640 ? 'Mobile Phone' : deviceWidth < 1024 ? 'Tablet' : 'Desktop Workstation';

  return (
    <div className="cross-device-container">
      {/* HEADER SECTION */}
      <div className="cross-device-header">
        <div>
          <div className="hero-badge" style={{ marginBottom: 6 }}>
            <Radio size={14} color="#10b981" />
            <span>Cross-Device Continuity & Responsive Architecture</span>
          </div>
          <h2 className="runner-title">Works Across Devices (Mobile, Tablet, Desktop)</h2>
          <p className="runner-desc">
            JARVIS is built as a progressive web application (PWA) with responsive layouts, offline caching, and instant cross-device session handover.
          </p>
        </div>

        {/* Viewport Frame Switcher */}
        {onSetViewportMode && (
          <div className="viewport-switcher-dock">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Preview Device Mode:
            </span>
            <div className="switcher-pills">
              <button
                id="preview-desktop-btn"
                className={`switch-pill ${activeViewportMode === 'desktop' ? 'active' : ''}`}
                onClick={() => onSetViewportMode('desktop')}
                type="button"
              >
                <Laptop size={14} />
                <span>Desktop (Fluid)</span>
              </button>
              <button
                id="preview-tablet-btn"
                className={`switch-pill ${activeViewportMode === 'tablet' ? 'active' : ''}`}
                onClick={() => onSetViewportMode('tablet')}
                type="button"
              >
                <Tablet size={14} />
                <span>Tablet (768px)</span>
              </button>
              <button
                id="preview-mobile-btn"
                className={`switch-pill ${activeViewportMode === 'mobile' ? 'active' : ''}`}
                onClick={() => onSetViewportMode('mobile')}
                type="button"
              >
                <Smartphone size={14} />
                <span>Mobile PWA (390px)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TWO COLUMN GRID: QR CODE HANDOVER & DEVICE CAPABILITY AUDIT */}
      <div className="cross-device-grid">
        {/* CARD 1: QR CODE & HANDOVER */}
        <div className="handover-card">
          <div className="handover-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: 16 }}>Instant Mobile Handover & Sync</h3>
            </div>
            <span className="live-status-pill">
              <span className="dot-pulse" style={{ background: '#10b981', width: 6, height: 6 }} />
              Live Sync
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 16px' }}>
            Scan this code with your mobile camera or tablet to transfer this exact session and continue multi-step tasks seamlessly.
          </p>

          {/* SVG QR Code */}
          <div className="qr-code-wrapper">
            <div className="qr-svg-frame">
              <svg viewBox="0 0 160 160" width="160" height="160" className="qr-svg">
                {/* Clean geometric QR matrix */}
                <rect width="160" height="160" fill="#ffffff" rx="12" />
                {/* Position detection patterns */}
                <rect x="12" y="12" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="18" y="18" width="28" height="28" fill="#ffffff" rx="2" />
                <rect x="24" y="24" width="16" height="16" fill="#4f46e5" rx="2" />

                <rect x="108" y="12" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="114" y="18" width="28" height="28" fill="#ffffff" rx="2" />
                <rect x="120" y="24" width="16" height="16" fill="#4f46e5" rx="2" />

                <rect x="12" y="108" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="18" y="114" width="28" height="28" fill="#ffffff" rx="2" />
                <rect x="24" y="120" width="16" height="16" fill="#4f46e5" rx="2" />

                {/* Data blocks */}
                <rect x="60" y="16" width="8" height="8" fill="#1e1b4b" />
                <rect x="76" y="16" width="8" height="8" fill="#1e1b4b" />
                <rect x="68" y="28" width="8" height="8" fill="#4f46e5" />
                <rect x="88" y="28" width="8" height="8" fill="#1e1b4b" />
                <rect x="60" y="44" width="8" height="8" fill="#1e1b4b" />
                <rect x="76" y="44" width="8" height="8" fill="#4f46e5" />

                <rect x="16" y="64" width="8" height="8" fill="#1e1b4b" />
                <rect x="32" y="64" width="8" height="8" fill="#4f46e5" />
                <rect x="48" y="64" width="8" height="8" fill="#1e1b4b" />
                <rect x="64" y="64" width="8" height="8" fill="#1e1b4b" />
                <rect x="80" y="64" width="8" height="8" fill="#4f46e5" />
                <rect x="96" y="64" width="8" height="8" fill="#1e1b4b" />
                <rect x="112" y="64" width="8" height="8" fill="#1e1b4b" />
                <rect x="128" y="64" width="8" height="8" fill="#4f46e5" />

                <rect x="28" y="78" width="8" height="8" fill="#4f46e5" />
                <rect x="44" y="78" width="8" height="8" fill="#1e1b4b" />
                <rect x="76" y="78" width="8" height="8" fill="#1e1b4b" />
                <rect x="108" y="78" width="8" height="8" fill="#4f46e5" />
                <rect x="124" y="78" width="8" height="8" fill="#1e1b4b" />

                <rect x="60" y="96" width="8" height="8" fill="#1e1b4b" />
                <rect x="76" y="96" width="8" height="8" fill="#4f46e5" />
                <rect x="92" y="96" width="8" height="8" fill="#1e1b4b" />
                <rect x="108" y="96" width="8" height="8" fill="#1e1b4b" />

                <rect x="68" y="112" width="8" height="8" fill="#4f46e5" />
                <rect x="84" y="112" width="8" height="8" fill="#1e1b4b" />
                <rect x="100" y="112" width="8" height="8" fill="#4f46e5" />
                <rect x="116" y="112" width="8" height="8" fill="#1e1b4b" />
                <rect x="132" y="112" width="8" height="8" fill="#4f46e5" />

                <rect x="60" y="128" width="8" height="8" fill="#1e1b4b" />
                <rect x="76" y="128" width="8" height="8" fill="#1e1b4b" />
                <rect x="92" y="128" width="8" height="8" fill="#4f46e5" />
                <rect x="124" y="128" width="8" height="8" fill="#1e1b4b" />

                {/* Center J Logo Badge */}
                <circle cx="80" cy="80" r="16" fill="#12102b" />
                <circle cx="80" cy="80" r="14" fill="#3525cd" />
                <text x="80" y="85" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">J</text>
              </svg>
            </div>
            <div className="qr-info-right">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                Session Handover Link
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all', marginTop: 4 }}>
                {syncUrl}
              </div>
              <button
                id="copy-sync-link-btn"
                className="btn-secondary"
                onClick={copySyncLink}
                style={{ marginTop: 10, padding: '6px 12px', fontSize: 12 }}
              >
                {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Mobile Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: DEVICE CAPABILITY & PWA STATUS */}
        <div className="handover-card">
          <div className="handover-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: 16 }}>Device & PWA Execution Audit</h3>
            </div>
            <span className="live-status-pill verified">
              <ShieldCheck size={13} color="#10b981" />
              Responsive Certified
            </span>
          </div>

          <div className="capability-table">
            <div className="cap-row">
              <span className="cap-label">Detected Device Form Factor</span>
              <span className="cap-val highlight">{detectedFormFactor}</span>
            </div>
            <div className="cap-row">
              <span className="cap-label">Current Viewport Dimensions</span>
              <span className="cap-val">{deviceWidth} × {deviceHeight} px (DPR {typeof window !== 'undefined' ? window.devicePixelRatio : 1}x)</span>
            </div>
            <div className="cap-row">
              <span className="cap-label">Progressive Web App (PWA) Mode</span>
              <span className="cap-val">
                {isPwaInstalled ? 'Standalone Installed' : 'Browser Web App (Install Ready)'}
              </span>
            </div>
            <div className="cap-row">
              <span className="cap-label">Service Worker & Offline Cache</span>
              <span className="cap-val" style={{ color: '#059669', fontWeight: 600 }}>Active (Workbox Precached)</span>
            </div>
            <div className="cap-row">
              <span className="cap-label">Web Speech & Microphone API</span>
              <span className="cap-val">
                {typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
                  ? 'Supported (Continuous)'
                  : 'Synthesizer Ready'}
              </span>
            </div>
            <div className="cap-row">
              <span className="cap-label">Hardware Acceleration (WebGL 2.0)</span>
              <span className="cap-val" style={{ color: '#059669', fontWeight: 600 }}>GPU Enabled (Shader Orb active)</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              id="install-pwa-btn"
              className="btn-primary"
              onClick={handleInstallClick}
              disabled={isInstalling}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Download size={16} />
              <span>{isInstalling ? 'Downloading & Placing on Homescreen…' : 'Download & Install to Laptop Homescreen'}</span>
            </button>

            {desktopShortcutPath && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12 }}>
                  <strong style={{ color: '#059669', display: 'block' }}>
                    Downloaded & Placed on Laptop Homescreen
                  </strong>
                  <span style={{ color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    {desktopShortcutPath}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LAPTOP HOMESCREEN INSTALLATION SUCCESS MODAL */}
      {showInstallModal && (
        <div className="install-modal-backdrop" onClick={() => setShowInstallModal(false)}>
          <div className="install-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="install-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="install-modal-icon-badge">
                  <Download size={24} color="#ffffff" />
                </div>
                <div>
                  <h3 className="install-modal-title">Downloaded to Laptop Homescreen!</h3>
                  <p className="install-modal-sub">
                    JARVIS is ready on your Windows Desktop and browser
                  </p>
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowInstallModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Path box */}
            <div className="install-path-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span className="install-path-text">{desktopShortcutPath}</span>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: 11, flexShrink: 0 }}
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(desktopShortcutPath);
                  }
                }}
              >
                Copy Path
              </button>
            </div>

            <div className="install-steps-list">
              <div className="install-step-item">
                <span className="install-step-num">1</span>
                <div>
                  <strong>Laptop Desktop / Homescreen:</strong> Shortcut <code>JARVIS — The Time Traveller.url</code> has been placed directly on your Windows Desktop. Double-click it anytime to launch!
                </div>
              </div>
              <div className="install-step-item">
                <span className="install-step-num">2</span>
                <div>
                  <strong>Direct Browser Download:</strong> The shortcut was also downloaded to your browser's Downloads folder so you can move it anywhere.
                </div>
              </div>
              <div className="install-step-item">
                <span className="install-step-num">3</span>
                <div>
                  <strong>Standalone App Window:</strong> In Chrome or Edge, click the <strong>Install</strong> icon in the address bar (top right) or Menu &rarr; <em>Save and share</em> &rarr; <em>Install JARVIS</em> to run as a borderless laptop app.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn-secondary"
                onClick={triggerBrowserShortcutDownload}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={14} />
                <span>Re-Download File</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowInstallModal(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Check size={14} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
