import { useEffect, useRef, useState } from 'react';

import { Pause, Play } from 'lucide-react';
import { useTranslations } from 'use-intl';

import { FadeInImage } from '@/shared/components/fade-in-image';
import { cn } from '@/shared/format/helpers';

let activePreviewAudio: HTMLAudioElement | null = null;

export function PreviewAudioImage({
   src,
   alt,
   previewUrl,
   className,
   imageClassName,
   width,
   height,
   fill,
   sizes,
   priority = false
}: {
   src: string;
   alt: string;
   previewUrl?: string;
   className?: string;
   imageClassName?: string;
   width?: number;
   height?: number;
   fill?: boolean;
   sizes?: string;
   priority?: boolean;
}) {
   const [isPlaying, setIsPlaying] = useState(false);
   const [isHovering, setIsHovering] = useState(false);
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const t = useTranslations();

   useEffect(() => {
      return () => {
         const audio = audioRef.current;
         if (!audio) return;
         audio.pause();
         audio.src = '';
         if (activePreviewAudio === audio) activePreviewAudio = null;
         audioRef.current = null;
      };
   }, []);

   function stopCurrentPreview() {
      if (!activePreviewAudio) return;
      activePreviewAudio.pause();
      activePreviewAudio.currentTime = 0;
      activePreviewAudio.dispatchEvent(new Event('pause'));
      activePreviewAudio = null;
   }

   function togglePreview(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();

      if (!previewUrl) return;

      if (!audioRef.current) {
         const audio = new Audio(previewUrl);
         audioRef.current = audio;
         audio.onended = () => {
            setIsPlaying(false);
            if (activePreviewAudio === audio) activePreviewAudio = null;
         };
         audio.onpause = () => {
            setIsPlaying(false);
            if (activePreviewAudio === audio) activePreviewAudio = null;
         };
      }

      const audio = audioRef.current;

      if (isPlaying) {
         audio.pause();
         audio.currentTime = 0;
         setIsPlaying(false);
         if (activePreviewAudio === audio) activePreviewAudio = null;
         return;
      }

      stopCurrentPreview();

      audio
         .play()
         .then(() => {
            activePreviewAudio = audio;
            setIsPlaying(true);
         })
         .catch(() => {
            setIsPlaying(false);
         });
   }

   return (
      <div
         className={cn('group relative overflow-hidden', className)}
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}
      >
         <FadeInImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            sizes={sizes}
            priority={priority}
            className={cn(
               'h-full w-full object-cover transition duration-200',
               isPlaying ? 'opacity-55 saturate-75' : 'opacity-100',
               isHovering && !isPlaying && 'opacity-80',
               imageClassName
            )}
         />

         <div
            className={cn(
               'pointer-events-none absolute inset-0 bg-black/20 transition-opacity duration-200',
               isHovering || isPlaying ? 'opacity-100' : 'opacity-0'
            )}
         />

         {previewUrl && (
            <button
               type="button"
               onClick={togglePreview}
               aria-label={isPlaying ? t('map.pausePreview') : t('map.playPreview')}
               className={cn(
                  'absolute inset-0 z-10 flex cursor-pointer items-center justify-center transition-opacity duration-200 max-md:opacity-100',
                  isHovering || isPlaying ? 'opacity-100' : 'opacity-0'
               )}
            >
               <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/50 text-white shadow-lg backdrop-blur-sm transition hover:scale-105">
                  {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
               </span>
            </button>
         )}
      </div>
   );
}
