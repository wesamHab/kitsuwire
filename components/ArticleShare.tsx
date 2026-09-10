"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Mail, Share2 } from "lucide-react";

export function ArticleShare({title}:{title:string}){
 const[copied,setCopied]=useState(false);
 const copy=async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);window.setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}};
 const share=async()=>{if(navigator.share){try{await navigator.share({title,url:window.location.href})}catch{return}}else await copy()};
 const linkedin=()=>window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,"_blank","noopener,noreferrer");
 const x=()=>window.open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,"_blank","noopener,noreferrer");
 const email=()=>{window.location.href=`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${window.location.href}`)}`};
 return <div className="article-share" aria-label="Share article"><span>SHARE</span><button type="button" onClick={share} aria-label="Share article"><Share2 size={16}/></button><button type="button" onClick={linkedin} aria-label="Share on LinkedIn"><Linkedin size={16}/></button><button type="button" onClick={x} aria-label="Share on X"><b aria-hidden="true">X</b></button><button type="button" onClick={email} aria-label="Share by email"><Mail size={16}/></button><button type="button" onClick={copy} aria-label="Copy article link">{copied?<Check size={16}/>:<Copy size={16}/>}</button>{copied?<small>Copied</small>:null}</div>;
}
