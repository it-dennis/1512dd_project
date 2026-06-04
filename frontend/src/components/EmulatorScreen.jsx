import { useEffect, useRef, useState } from 'react';

const EMULATOR_CONFIG = {
  wasm_path: '/v86/v86.wasm',
  bios: { url: '/v86/seabios.bin' },
  vga_bios: { url: '/v86/vgabios.bin' },
  fda: { url: '/v86/freedos722.img' },
  autostart: true,
  memory_size: 32 * 1024 * 1024,
  vga_memory_size: 2 * 1024 * 1024,
};

export default function EmulatorScreen() {
  // containerRef  = fullscreen target (outer wrapper)
  // screenRef     = v86 screen_container (text div + canvas, natural size)
  const containerRef = useRef(null);
  const screenRef    = useRef(null);
  const emulatorRef  = useRef(null);

  const [status, setStatus]         = useState('idle');
  const [started, setStarted]       = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startEmulator = () => {
    if (!window.V86) { setStatus('error'); return; }
    setStatus('loading');
    setStarted(true);
    emulatorRef.current = new window.V86({
      ...EMULATOR_CONFIG,
      screen_container: screenRef.current,
    });
    emulatorRef.current.add_listener('emulator-ready', () => setStatus('ready'));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (emulatorRef.current) emulatorRef.current.destroy(); };
  }, []);

  // F11 → toggle fullscreen (capture phase so v86 never sees it)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'F11') return;
      e.preventDefault();
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  // Fullscreen change → scale the v86 screen container to fill the viewport
  useEffect(() => {
    const onFsChange = () => {
      const screen = screenRef.current;
      if (!screen) return;

      if (document.fullscreenElement) {
        setIsFullscreen(true);
        // Reset any previous transform so we measure the natural size
        screen.style.transform = '';
        screen.style.transformOrigin = '';

        // Two rAFs: first lets React/browser settle the layout,
        // second reads correct natural dimensions of the v86 container
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const sw = screen.offsetWidth;
          const sh = screen.offsetHeight;
          if (!sw || !sh) return;

          const fw = window.innerWidth;
          const fh = window.innerHeight;
          const scale = Math.min(fw / sw, fh / sh);

          // getBoundingClientRect gives position relative to viewport,
          // so we can correct for statusbar / gap offsets
          const rect = screen.getBoundingClientRect();
          const tx = (fw - sw * scale) / 2 - rect.left;
          const ty = (fh - sh * scale) / 2 - rect.top;

          screen.style.transformOrigin = 'top left';
          screen.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        }));
      } else {
        setIsFullscreen(false);
        screen.style.transform = '';
        screen.style.transformOrigin = '';
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const statusLabel = {
    idle:    null,
    loading: 'Starte DOS...',
    ready:   'Bereit',
    error:   'v86 nicht gefunden — Binärdateien fehlen (siehe README)',
  }[status];

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center bg-crt-black"
      style={{ gap: isFullscreen ? 0 : '1rem' }}
    >
      {/* Status bar */}
      {statusLabel && !isFullscreen && (
        <div className="flex items-center gap-2 self-start">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready'   ? 'bg-phosphor' :
            status === 'error'   ? 'bg-red-500'  :
            'bg-phosphor animate-pulse'
          }`} />
          <span className="font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
            {statusLabel}
          </span>
        </div>
      )}

      {/* v86 screen_container — must have: first a div (text mode), then a canvas (VGA).
          No w-full here: natural width so fullscreen scale is calculated from actual content size. */}
      <div
        ref={screenRef}
        className="border border-phosphor-muted/30 rounded bg-crt-black"
        style={{
          minHeight: started ? '400px' : '0',
          width: started ? '720px' : '0',
          maxWidth: '100%',
        }}
      >
        <div style={{ whiteSpace: 'pre', font: '14px monospace', lineHeight: '14px' }} />
        <canvas style={{ display: 'block' }} />
      </div>

      {/* Start button */}
      {!started && (
        <button onClick={startEmulator} className="btn-primary text-base px-8 py-3">
          PC1512 starten
        </button>
      )}

      {started && status === 'ready' && !isFullscreen && (
        <p className="font-mono text-xs" style={{ color: 'rgba(30,167,88,0.50)' }}>
          Klick auf den Bildschirm um Tastatureingaben zu aktivieren · F11 = Vollbild
        </p>
      )}
    </div>
  );
}
