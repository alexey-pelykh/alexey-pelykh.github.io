'use client';

import Script from 'next/script';

export default function TallyEmbed() {
  return (
    <>
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          (window as any).Tally?.loadEmbeds();
        }}
      />
      <iframe
        data-tally-src="https://tally.so/embed/obROxN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy"
        width="100%"
        height="640"
        title="Perception Check"
        style={{ border: 'none' }}
      />
    </>
  );
}
