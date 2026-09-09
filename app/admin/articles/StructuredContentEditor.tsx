"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Section = { heading: string; paragraphs: string; bullets: string };
type Faq = { question: string; answer: string };
type Source = { label: string; url: string };

export function StructuredContentEditor({ initialSections = [], initialFaq = [], initialSources = [] }: { initialSections?: Section[]; initialFaq?: Faq[]; initialSources?: Source[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [faq, setFaq] = useState<Faq[]>(initialFaq);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const sectionsJson = useMemo(() => JSON.stringify(sections), [sections]);
  const faqJson = useMemo(() => JSON.stringify(faq), [faq]);
  const sourcesJson = useMemo(() => JSON.stringify(sources), [sources]);

  return <div className="admin-structured-editor">
    <input type="hidden" name="sectionsJson" value={sectionsJson}/><input type="hidden" name="faqJson" value={faqJson}/><input type="hidden" name="sourcesJson" value={sourcesJson}/>

    <section className="admin-block-group">
      <div className="admin-block-head"><div><p className="admin-kicker">STRUCTURE</p><h2>Article sections</h2><small>Build the main guide structure. Use one paragraph or bullet per line.</small></div><button type="button" className="admin-outline-btn" onClick={() => setSections(v => [...v, { heading: "", paragraphs: "", bullets: "" }])}><Plus size={15}/> Add section</button></div>
      {sections.length === 0 ? <p className="admin-inline-empty">No sections yet.</p> : sections.map((section, index) => <article className="admin-content-block" key={index}>
        <div className="admin-content-block-title"><strong>Section {index + 1}</strong><button type="button" aria-label="Remove section" onClick={() => setSections(v => v.filter((_, i) => i !== index))}><Trash2 size={15}/></button></div>
        <label>Heading<input value={section.heading} onChange={e => setSections(v => v.map((x,i)=>i===index?{...x,heading:e.target.value}:x))}/></label>
        <label>Paragraphs<textarea rows={5} value={section.paragraphs} onChange={e => setSections(v => v.map((x,i)=>i===index?{...x,paragraphs:e.target.value}:x))}/></label>
        <label>Bullets<textarea rows={4} value={section.bullets} onChange={e => setSections(v => v.map((x,i)=>i===index?{...x,bullets:e.target.value}:x))}/></label>
      </article>)}
    </section>

    <section className="admin-block-group">
      <div className="admin-block-head"><div><p className="admin-kicker">SEO / READER VALUE</p><h2>FAQ</h2></div><button type="button" className="admin-outline-btn" onClick={() => setFaq(v => [...v, { question: "", answer: "" }])}><Plus size={15}/> Add FAQ</button></div>
      {faq.map((item,index)=><article className="admin-content-block" key={index}><div className="admin-content-block-title"><strong>Question {index+1}</strong><button type="button" onClick={()=>setFaq(v=>v.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div><label>Question<input value={item.question} onChange={e=>setFaq(v=>v.map((x,i)=>i===index?{...x,question:e.target.value}:x))}/></label><label>Answer<textarea rows={4} value={item.answer} onChange={e=>setFaq(v=>v.map((x,i)=>i===index?{...x,answer:e.target.value}:x))}/></label></article>)}
    </section>

    <section className="admin-block-group">
      <div className="admin-block-head"><div><p className="admin-kicker">TRUST</p><h2>Sources</h2></div><button type="button" className="admin-outline-btn" onClick={() => setSources(v => [...v, { label: "", url: "" }])}><Plus size={15}/> Add source</button></div>
      {sources.map((item,index)=><article className="admin-content-block admin-source-block" key={index}><div className="admin-content-block-title"><strong>Source {index+1}</strong><button type="button" onClick={()=>setSources(v=>v.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div><label>Label<input value={item.label} onChange={e=>setSources(v=>v.map((x,i)=>i===index?{...x,label:e.target.value}:x))}/></label><label>URL<input type="url" value={item.url} onChange={e=>setSources(v=>v.map((x,i)=>i===index?{...x,url:e.target.value}:x))}/></label></article>)}
    </section>
  </div>;
}
