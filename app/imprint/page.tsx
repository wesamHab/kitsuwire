import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getLegalOperator } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata=pageMetadata({title:"Imprint",description:"Legal information for KitsuWire.",path:"/imprint"});
export const dynamic="force-dynamic";

export default function Imprint(){
  const legal=getLegalOperator();
  return <main><SiteHeader/><section className="info-page shell"><span className="kicker">IMPRINT / IMPRESSUM</span><h1>Legal information.</h1><div className="info-copy">
    {!legal.ready?<div className="notice-card"><span>PRE-LAUNCH</span><h2>Operator details still required.</h2><p>The page is technically ready, but the production environment still needs the legally required operator name, service address and contact email before public launch.</p></div>:null}
    {legal.ready?<><h2>Provider</h2><p><strong>{legal.name}</strong><br/>{legal.addressLine1}<br/>{legal.postalCity}<br/>{legal.country}</p><h2>Contact</h2><p>Email: <a href={`mailto:${legal.email}`}>{legal.email}</a>{legal.phone?<><br/>Phone: {legal.phone}</>:null}</p>{legal.vatId?<><h2>VAT identification number</h2><p>{legal.vatId}</p></>:null}{legal.editorialResponsible?<><h2>Editorial responsibility</h2><p>{legal.editorialResponsible}</p></>:null}</>:<><p>Personal operator information is intentionally not stored in the public source repository. It is supplied through private server environment variables at runtime.</p><h2>Required production configuration</h2><p>Set LEGAL_OPERATOR_NAME, LEGAL_ADDRESS_LINE1, LEGAL_POSTAL_CITY and LEGAL_EMAIL in the private production environment. Optional fields are available for telephone, VAT ID and editorial responsibility.</p></>}
  </div></section><SiteFooter/></main>
}
