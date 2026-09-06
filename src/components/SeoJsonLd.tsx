import {
  touristAttractionSchema,
  faqPageSchema,
} from '@/lib/site';

type FaqItem = { q: string; a: string };

/**
 * Renders Schema.org JSON-LD (TouristAttraction + FAQPage) only on the
 * homepage, where the corresponding visible content lives.
 */
export default async function SeoJsonLd({ locale }: { locale: string }) {
  let faqItems: FaqItem[] = [];
  try {
    const messages = (await import(`@/messages/${locale}.json`)).default as any;
    const faq = messages?.faq?.items;
    if (Array.isArray(faq)) {
      faqItems = faq as FaqItem[];
    }
  } catch {
    // fall back to the attraction schema only
  }

  const attraction = touristAttractionSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(attraction) }}
      />
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqItems)) }}
        />
      )}
    </>
  );
}
