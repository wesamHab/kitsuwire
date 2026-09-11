"use client";

import { useEffect, useMemo, useState } from "react";

type Snapshot = {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string;
  category: string;
  sections: number;
  faq: number;
};

const EMPTY: Snapshot = { title:"", slug:"", excerpt:"", seoTitle:"", seoDescription:"", tags:"", category:"", sections:0, faq:0 };
const STOP = new Set(["what","is","are","the","a","an","and","or","to","of","for","in","on","with","how","why","your","guide","explained","beginner","beginners","complete","ultimate","2025","2026"]);

function cleanKeyword(value:string){
  const words=value.toLowerCase().replace(/[^a-z0-9+.#-]+/g," ").split(/\s+/).filter(Boolean).filter(word=>!STOP.has(word));
  return words.slice(0,4).join(" ");
}
function countJson(raw:string){try{const value=JSON.parse(raw);return Array.isArray(value)?value.length:0}catch{return 0}}
function setField(form:HTMLFormElement,name:string,value:string){
  const el=form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|null;
  if(!el)return;
  el.value=value;
  el.dispatchEvent(new Event("input",{bubbles:true}));
  el.dispatchEvent(new Event("change",{bubbles:true}));
}
function clip(value:string,max:number){return value.length<=max?value:value.slice(0,max-1).trimEnd()+"…"}

export function SeoAssistant(){
  const [data,setData]=useState<Snapshot>(EMPTY);
  useEffect(()=>{
    const host=document.querySelector("[data-seo-assistant]");
    const form=host?.closest("form") as HTMLFormElement|null;
    if(!form)return;
    const read=()=>{
      const value=(name:string)=>String((form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|null)?.value??"").trim();
      const categorySelect=form.elements.namedItem("categoryId") as HTMLSelectElement|null;
      setData({
        title:value("title"),slug:value("slug"),excerpt:value("excerpt"),seoTitle:value("seoTitle"),seoDescription:value("seoDescription"),tags:value("tags"),
        category:categorySelect?.selectedOptions?.[0]?.textContent?.trim()??"",
        sections:countJson(value("sectionsJson")),faq:countJson(value("faqJson")),
      });
    };
    read();
    form.addEventListener("input",read);form.addEventListener("change",read);
    return()=>{form.removeEventListener("input",read);form.removeEventListener("change",read)};
  },[]);

  const keyword=useMemo(()=>cleanKeyword(data.seoTitle||data.title),[data.seoTitle,data.title]);
  const lowerKeyword=keyword.toLowerCase();
  const tags=data.tags.split(",").map(v=>v.trim()).filter(Boolean);
  const checks=[
    {ok:data.seoTitle.length>=30&&data.seoTitle.length<=65,label:`SEO title ${data.seoTitle.length}/65`},
    {ok:data.seoDescription.length>=120&&data.seoDescription.length<=170,label:`Meta description ${data.seoDescription.length}/170`},
    {ok:!!keyword&&data.seoTitle.toLowerCase().includes(lowerKeyword),label:"Primary keyword in SEO title"},
    {ok:!!keyword&&data.seoDescription.toLowerCase().includes(lowerKeyword),label:"Primary keyword in meta description"},
    {ok:!!keyword&&data.excerpt.toLowerCase().includes(lowerKeyword),label:"Primary keyword in excerpt"},
    {ok:tags.length>=3,label:`${tags.length} tags (target 3+)`},
    {ok:data.sections>=3,label:`${data.sections} sections (target 3+)`},
    {ok:data.faq>=2,label:`${data.faq} FAQ entries (target 2+)`},
  ];
  const score=Math.round(checks.filter(c=>c.ok).length/checks.length*100);
  const topic=keyword||"your topic";
  const category=data.category.toLowerCase();
  const suggestions=category.includes("market")
    ? [`${topic} explained`,`${topic} outlook`,`${topic} risks and opportunities`,`${topic} for beginners`]
    : [`what is ${topic}`,`${topic} explained`,`${topic} beginner guide`,`${topic} vs alternatives`, `how ${topic} works`];

  function applyBasics(){
    const host=document.querySelector("[data-seo-assistant]");const form=host?.closest("form") as HTMLFormElement|null;if(!form)return;
    if(!data.seoTitle&&data.title)setField(form,"seoTitle",clip(data.title,60));
    if(!data.seoDescription){const base=data.excerpt||`${data.title}. Learn how it works, why it matters, key concepts, benefits, trade-offs and practical use cases in this clear KitsuWire guide.`;setField(form,"seoDescription",clip(base,158));}
    if(!data.tags&&keyword){const generated=keyword.split(" ").filter(Boolean).slice(0,4);setField(form,"tags",Array.from(new Set([topic,...generated])).slice(0,5).join(", "));}
  }

  return <div className="admin-seo-assistant" data-seo-assistant>
    <div className="admin-seo-assistant-head"><div><p className="admin-kicker">SEO ASSISTANT</p><strong>Search-readiness</strong></div><span>{score}%</span></div>
    <p>Primary topic: <b>{keyword||"Add a title to detect the topic"}</b></p>
    <div className="admin-seo-checks">{checks.map(check=><span className={check.ok?"ok":"todo"} key={check.label}>{check.ok?"✓":"○"} {check.label}</span>)}</div>
    <div className="admin-seo-keywords"><small>Long-tail ideas</small><div>{suggestions.map(item=><code key={item}>{item}</code>)}</div></div>
    <button className="admin-outline-btn" type="button" onClick={applyBasics}>Fill missing SEO basics</button>
    <small>Use these as guidance, not keyword stuffing. Search intent and useful content matter more than repetition.</small>
  </div>;
}
