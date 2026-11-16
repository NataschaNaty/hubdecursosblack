import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Volume2, Play } from 'lucide-react';
import Player from '@vimeo/player';

export default function Hero() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);

  // Official Vimeo Video: https://vimeo.com/1236240667?share=copy&fl=sv&fe=ci
  const VIMEO_VIDEO_ID = '1236240667';
  const VIMEO_THUMBNAIL = 'https://i.vimeocdn.com/video/2212682893-2883ab08e620b1ab3f3faaa3b163a7fb80d14ca99654a916fd75c88e5ec9a44f-d_1280?region=us';

  const handleStartVideo = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsMuted(true);
  };

  const handleUnmute = (e: MouseEvent) => {
    e.stopPropagation();
    setIsMuted(false);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: false }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
      } catch (_) {}
    }
    if (playerRef.current) {
      playerRef.current.setMuted(false).catch(() => {});
      playerRef.current.setVolume(1).catch(() => {});
    }
  };

  useEffect(() => {
    if (!hasStarted || !iframeRef.current) return;

    try {
      const player = new Player(iframeRef.current);
      playerRef.current = player;

      player.on('play', () => {
        setIsPlaying(true);
      });

      player.on('pause', () => {
        setIsPlaying(false);
      });

      player.on('ended', () => {
        setIsPlaying(false);
      });

      return () => {
        player.destroy().catch(() => {});
        playerRef.current = null;
      };
    } catch (err) {
      console.warn('Vimeo Player init error:', err);
    }
  }, [hasStarted]);

  const togglePlayPause = useCallback(async () => {
    if (!playerRef.current) {
      // Fallback via postMessage
      if (isPlaying) {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), '*');
        setIsPlaying(false);
      } else {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: 'play' }), '*');
        setIsPlaying(true);
      }
      return;
    }

    try {
      const paused = await playerRef.current.getPaused();
      if (paused) {
        await playerRef.current.play();
        setIsPlaying(true);
      } else {
        await playerRef.current.pause();
        setIsPlaying(false);
      }
    } catch {
      if (isPlaying) {
        playerRef.current.pause().catch(() => {});
        setIsPlaying(false);
      } else {
        playerRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  return (
    <section className="relative pt-8 pb-10 md:pt-24 md:pb-20 overflow-hidden bg-neutral-950 text-white border-b border-white/10">
      {/* Subtle ambient Black Friday background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center w-full"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-brand-primary/25 text-white border-2 border-amber-400/80 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-black uppercase tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.28)] ring-1 ring-amber-400/30 mb-6">
            <span className="text-amber-300 text-[10px] sm:text-sm font-black drop-shadow-[0_1px_8px_rgba(251,191,36,0.4)]">BLACK FRIDAY DA NATY</span>
            <span className="text-amber-400/60">•</span>
            <span className="bg-gradient-to-r from-brand-primary to-rose-500 text-white px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black shadow-md shadow-brand-primary/40 border border-white/25">
              50% OFF EM TUDO
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 text-white max-w-4xl mx-auto">
            <span className="text-brand-primary">Aprenda todo o método</span> que eu uso na minha confeitaria para vender doces <span className="text-amber-400">todos os dias</span> na loja e delivery
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto leading-snug mb-4 sm:mb-6">
            <span className="block text-[15px]">Posso adiantar, o segredo não está na receitas!</span>
            <span className="block text-amber-400 font-bold mt-0.5">Assista ao vídeo abaixo para entender</span>
          </p>

          {/* Featured Video (VSL) Area - Centered and beautifully framed below Title */}
          <div className="my-4 md:my-6 w-full max-w-xl md:max-w-2xl relative mx-auto">
            <div className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-brand-primary/15 border-4 md:border-6 border-neutral-800 ring-1 ring-amber-400/30 bg-black aspect-video flex items-center justify-center">
              {hasStarted ? (
                <div className="relative w-full h-full">
                  {/* Vimeo Player Embed with muted=1 for foolproof Safari playback */}
                  <iframe
                    ref={iframeRef}
                    src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?autoplay=1&muted=1&controls=0&title=0&byline=0&portrait=0&badge=0&share=0&autopause=0&transparent=0&api=1`}
                    className="w-full h-full border-0 pointer-events-none select-none"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    title="Apresentação Cursos Doces da Naty"
                  />

                  {/* Floating Unmute Button */}
                  {isMuted && (
                    <button
                      type="button"
                      onClick={handleUnmute}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-brand-primary text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all animate-pulse border-2 border-white/90 cursor-pointer"
                    >
                      <span className="text-lg">🔊</span>
                      <span>Toque para ouvir</span>
                    </button>
                  )}

                  {/* Interactive Screen Overlay to Pause / Resume on click */}
                  <div
                    onClick={togglePlayPause}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        togglePlayPause();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={isPlaying ? "Clique na tela para pausar o vídeo" : "Clique na tela para continuar o vídeo"}
                    className="absolute inset-0 z-20 cursor-pointer select-none flex items-center justify-center group"
                  >
                    {/* Visual indicator when paused */}
                    {!isPlaying && (
                      <div className="flex flex-col items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] w-full h-full animate-in fade-in duration-200">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform border-2 border-white/80">
                          <Play size={28} className="fill-white translate-x-0.5 sm:size-8" />
                        </div>
                        <span className="mt-3 px-4 py-1.5 rounded-full bg-black/75 border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow shadow-lg">
                          Vídeo pausado • Clique para continuar
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Initial Paused State: Cover thumbnail & Start with Sound button */
                <div 
                  onClick={handleStartVideo}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center select-none overflow-hidden group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStartVideo();
                    }
                  }}
                  aria-label="Iniciar vídeo com som"
                >
                  {/* Real Vimeo video poster thumbnail */}
                  <img
                    src={VIMEO_THUMBNAIL}
                    alt="Vídeo Apresentação Naty"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] group-hover:bg-black/30 transition-colors" />

                  {/* Pulsing Start Video With Sound Button */}
                  <div className="relative z-10 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartVideo();
                      }}
                      className="group/btn relative flex items-center gap-2.5 sm:gap-3 bg-brand-primary text-white px-5 py-3 sm:px-7 sm:py-3.5 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse border-2 border-white/70 cursor-pointer"
                    >
                      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Play size={20} className="fill-white translate-x-0.5" />
                      </span>
                      <span>Clique para iniciar com som</span>
                    </button>
                    <p className="text-white/95 text-xs sm:text-sm font-medium mt-3 drop-shadow flex items-center gap-1.5">
                      <Volume2 size={16} className="text-rose-300" />
                      Toque para assistir à apresentação oficial
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-6 w-full sm:w-auto">
            <a 
              href="#cursos" 
              className="flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-rose-600 transition-all shadow-xl shadow-brand-primary/25 w-full sm:w-auto"
            >
              Veja todos os meus cursos (50% OFF)
              <ArrowRight size={20} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
