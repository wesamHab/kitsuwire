"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Share2 } from "lucide-react";

export function ArticleShare({title}:{title:string}){
 const[copied,setCopied]=useState(false);
 const copy=async()=>{await navigator.clipboard.writeText(window.location.href);setCopied(true);window.setTimeout(()=>setCopied(false),1800)};
 const share=async()=>{if(navigator.share){await navigator.share({title,url:window.location.href})}else await copy()};
 const linkedin=()=>window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,"_blank","noopener,noreferrer");
 return <div className="article-share" aria-label="Share article"><span>SHARE</span><button onClick={share} aria-label="Share article"><Share2 size={16}/></button><button onClick={linkedin} aria-label="Share on LinkedIn"><Linkedin size={16}/></button><button onClick={copy} aria-label="Copy article link">{copied?<Check size={16}/>:<Copy size={16}/>}</button>{copied?<small>Copied</small>:null}</div>;
}
