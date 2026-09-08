import { Bot, Boxes, BrainCircuit, ChartCandlestick, Cloud, Code2, Coins, Container, Cpu, Database, GitBranch, Globe2, Layers3, Network, PackageOpen, ServerCog, Sparkles, TrendingUp } from "lucide-react";
import type { Article } from "@/lib/articles";

type Props={article:Pick<Article,"slug"|"category"|"categoryLabel"|"title">;compact?:boolean};

function artworkKind(slug:string){
 if(slug.includes("kubernetes"))return "kubernetes";
 if(slug.includes("docker"))return "docker";
 if(slug.includes("terraform"))return "terraform";
 if(slug.includes("git"))return "git";
 if(slug.includes("api"))return "api";
 if(slug.includes("devops")||slug.includes("ci-cd"))return "devops";
 if(slug.includes("microservices"))return "microservices";
 if(slug.includes("data-center")||slug.includes("infrastructure"))return "datacenter";
 if(slug.includes("cloud"))return "cloud";
 if(slug.includes("internet"))return "network";
 if(slug.includes("gold"))return "gold";
 if(slug.includes("inflation")||slug.includes("interest"))return "rates";
 if(slug.includes("stock")||slug.includes("investor")||slug.includes("etf"))return "markets";
 if(slug.includes("agent"))return "agents";
 if(slug.includes("language-model")||slug.includes("generative"))return "llm";
 if(slug.includes("chip")||slug.includes("compute"))return "chip";
 return "default";
}

const Icon=({kind}:{kind:string})=>{
 const p={size:46,strokeWidth:1.6};
 switch(kind){
  case"kubernetes":return <Network {...p}/>;
  case"docker":return <Container {...p}/>;
  case"terraform":return <Layers3 {...p}/>;
  case"git":return <GitBranch {...p}/>;
  case"api":return <PackageOpen {...p}/>;
  case"devops":return <ServerCog {...p}/>;
  case"microservices":return <Boxes {...p}/>;
  case"datacenter":return <Database {...p}/>;
  case"cloud":return <Cloud {...p}/>;
  case"network":return <Globe2 {...p}/>;
  case"gold":return <Coins {...p}/>;
  case"rates":return <TrendingUp {...p}/>;
  case"markets":return <ChartCandlestick {...p}/>;
  case"agents":return <Bot {...p}/>;
  case"llm":return <BrainCircuit {...p}/>;
  case"chip":return <Cpu {...p}/>;
  default:return <Sparkles {...p}/>;
 }
};

export function ArticleArtwork({article,compact=false}:Props){
 const kind=artworkKind(article.slug);
 return <div className={`article-artwork artwork-${article.category} artwork-${kind}${compact?" is-compact":""}`} aria-hidden="true">
   <div className="art-grid"/><div className="art-glow"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
   <div className="art-icon"><Icon kind={kind}/></div>
   <div className="art-label"><span>{article.categoryLabel}</span><strong>{kind.replace("microservices","services").toUpperCase()}</strong></div>
 </div>
}
