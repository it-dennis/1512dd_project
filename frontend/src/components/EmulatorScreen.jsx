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
  const containerRef = useRef(null);
  const screenRef    = useRef(null);
  const emulatorRef  = useRef(null);
  const rafRef       = useRef(null);

  const [status,      setStatus]      = useState('idle');
  const [started,     setStarted]     = useState(false);
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

  useEffect(() => {
    return () => { if (emulatorRef.current) emulatorRef.current.destroy(); };
  }, []);

  // F11 — intercept before v86 can receive it
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

  // Core: apply a centered scale-transform to screenRef so it fills the viewport.
  // Called on fullscreen entry AND whenever v86 changes the VGA mode (ResizeObserver).
  const applyTransform = () => {
    const screen = screenRef.current;
    if (!screen || !document.fullscreenElement) return;

    // Temporarily clear the transform so we read the natural (untransformed) size.
    screen.style.transform = '';
    screen.style.transformOrigin = '';

    const sw = screen.offsetWidth;
    const sh = screen.offsetHeight;
    if (!sw || !sh) return;

    const fw = window.innerWidth;
    const fh = window.innerHeight;
    const scale = Math.min(fw / sw, fh / sh);

    // getBoundingClientRect gives the current position relative to the viewport;
    // we subtract it so the translate moves the element to the perfectly centred spot.
    const rect = screen.getBoundingClientRect();
    const tx = (fw - sw * scale) / 2 - rect.left;
    const ty = (fh - sh * scale) / 2 - rect.top;

    screen.style.transformOrigin = 'top left';
    screen.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  // Debounced wrapper used by ResizeObserver to avoid transform thrashing
  // during rapid VGA mode transitions.
  const scheduleTransform = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      applyTransform();
      rafRef.current = null;
    });
  };

  // Fullscreen enter/exit
  useEffect(() => {
    const onFsChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        // Two rAFs: first lets React re-render with fullscreen styles (natural width),
        // second reads the correct settled dimensions.
        requestAnimationFrame(() => requestAnimationFrame(applyTransform));
      } else {
        setIsFullscreen(false);
        const screen = screenRef.current;
        if (screen) {
          screen.style.transform = '';
          screen.style.transformOrigin = '';
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Watch for VGA mode changes (canvas / text-div resize) while in fullscreen.
  useEffect(() => {
    if (!screenRef.current) return;
    const ro = new ResizeObserver(() => {
      if (document.fullscreenElement) scheduleTransform();
    });
    ro.observe(screenRef.current);
    return () => ro.disconnect();
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
      {!isFullscreen && statusLabel && (
        <div className="flex items-center gap-2 self-start">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready' ? 'bg-phosphor' :
            status === 'error' ? 'bg-red-500'  :
            'bg-phosphor animate-pulse'
          }`} />
          <span className="font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
            {statusLabel}
          </span>
        </div>
      )}

      {/*
        screenRef = v86 screen_container.
        Normal mode : fixed 720 px wide, canvas stretched to fill (looks good in card).
        Fullscreen  : no fixed width → shrinks to natural content size (canvas or text div),
                      so the scale factor is based on actual content, not dead space.
        minHeight only in normal mode so the box doesn't collapse before v86 renders.
      */}
      <div
        ref={screenRef}
        className={`bg-crt-black ${isFullscreen ? '' : 'border border-phosphor-muted/30 rounded flex justify-center'}`}
        style={isFullscreen ? {
          width: 'max-content',
        } : {
          width: '720px',
          maxWidth: '100%',
          // minHeight only while loading so the box doesn't collapse before v86 renders;
          // once ready, let the canvas / text-div dictate the height naturally.
          minHeight: status === 'loading' ? '400px' : undefined,
        }}
      >
        <div style={{ whiteSpace: 'pre', font: '14px monospace', lineHeight: '14px' }} />
        <canvas style={{ display: 'block' }} />
      </div>

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
