import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export const metadata=pageMetadata({title:"Terms & Editorial Disclaimer",description:"Terms of use and editorial disclaimer for KitsuWire.",path:"/terms"});

export default function Terms(){return <main><SiteHeader/><section className="info-page shell"><span className="kicker">TERMS</span><h1>Terms & editorial disclaimer.</h1><div className="info-copy">
  <h2>Informational purpose</h2><p>KitsuWire publishes educational and editorial material about artificial intelligence, technology, software and markets. Content is provided for general information and does not constitute individualized professional advice.</p>
  <h2>Markets and finance</h2><p>Articles discussing markets, securities, commodities, interest rates or other financial topics are not investment, tax or legal advice and are not a recommendation to buy, sell or hold a particular asset. Readers should assess information independently and, where appropriate, consult a qualified professional.</p>
  <h2>Accuracy and updates</h2><p>KitsuWire aims to explain complex topics clearly and to use reliable sources, but technology and market information can change quickly. No guarantee is made that every page is complete, current or error-free at every moment. Material may be corrected, expanded or archived.</p>
  <h2>External sources and links</h2><p>Articles may reference third-party websites, documentation and research. KitsuWire does not control third-party content or availability. A link is provided as a source or useful reference and does not automatically imply endorsement.</p>
  <h2>Copyright</h2><p>Unless otherwise indicated, the original KitsuWire text, design and artwork are protected content. Third-party names, trademarks and cited materials remain the property of their respective owners.</p>
  <h2>Availability</h2><p>The website may be changed, maintained or temporarily unavailable without notice. Features such as newsletters and advertising may be introduced, changed or removed over time.</p>
</div></section><SiteFooter/></main>}
