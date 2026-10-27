'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useState } from 'react';

import { ExternalLink, Loader2, Map } from 'lucide-react';
import { useTranslations } from 'use-intl';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { getArcviewerUrl } from '@/shared/arcviewer-url';
import { cn } from '@/shared/format/helpers';
import { isMobileViewport } from '@/shared/ui-adjacent/viewport';

interface ViewerDialogProps {
   bsid: string;
   trigger: (props: ViewerTriggerProps) => ReactNode;
   tooltip?: string;
   tooltipDelayMs?: number;
   tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

interface ViewerTriggerProps {
   viewerUrl: string;
   openViewerAction: (event: MouseEvent<HTMLElement>) => void;
}

export function ViewerDialog({ bsid, trigger, tooltip, tooltipDelayMs, tooltipSide }: ViewerDialogProps) {
   const t = useTranslations();
   const [loaded, setLoaded] = useState(false);
   const [open, setOpen] = useState(false);
   const [tooltipOpen, setTooltipOpen] = useState(false);

   const viewerUrl = getArcviewerUrl({ map: bsid });

   const openViewerAction = (event: MouseEvent<HTMLElement>) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      setTooltipOpen(false);

      if (isMobileViewport()) {
         window.open(viewerUrl, '_blank', 'noopener,noreferrer');
         return;
      }

      setOpen(true);
   };

   const renderedTrigger = trigger({ viewerUrl, openViewerAction });

   const wrappedTrigger = tooltip ? (
      <Tooltip open={tooltipOpen && !open} onOpenChange={setTooltipOpen} delayDuration={tooltipDelayMs}>
         <TooltipTrigger asChild>{renderedTrigger}</TooltipTrigger>
         <TooltipContent side={tooltipSide} className="whitespace-nowrap">
            <p className="leading-none">{tooltip}</p>
         </TooltipContent>
      </Tooltip>
   ) : (
      renderedTrigger
   );

   return (
      <Dialog
         open={open}
         onOpenChange={(next) => {
            setOpen(next);
            if (!next) setLoaded(false);
         }}
      >
         {wrappedTrigger}

         <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw]" aria-describedby={undefined} showCloseButton>
            <DialogHeader>
               <DialogTitle className="flex min-w-0 items-center gap-2">
                  <Map className="size-4 shrink-0" />

                  <span className="min-w-0 truncate">{t('map.mapViewer')}</span>

                  <Tooltip>
                     <TooltipTrigger asChild>
                        <a
                           href={viewerUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label={t('common.openInNewTab')}
                           className="text-muted-foreground hover:text-primary transition-colors"
                        >
                           <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                     </TooltipTrigger>

                     <TooltipContent>
                        <p>{t('common.openInNewTab')}</p>
                     </TooltipContent>
                  </Tooltip>
               </DialogTitle>
            </DialogHeader>

            <div className="bg-card relative aspect-video max-h-[80vh] w-full overflow-hidden rounded-md border">
               {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 className="text-muted-foreground/40 size-6 animate-spin" />
                  </div>
               )}

               {open && (
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                     <iframe
                        src={viewerUrl}
                        title={t('map.mapViewer')}
                        className={cn(
                           'absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] border-0 bg-black transition-opacity duration-300',
                           loaded ? 'animate-in fade-in opacity-100 duration-300' : 'opacity-0'
                        )}
                        onLoad={() => setLoaded(true)}
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                        allowFullScreen
                     />
                  </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
