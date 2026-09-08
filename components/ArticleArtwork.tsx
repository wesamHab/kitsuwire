import { Bot, BrainCircuit, ChartCandlestick, Cloud, Coins, Container, Cpu, Database, GitBranch, Github, Globe2, Network, ServerCog, Sparkles, TrendingUp, Workflow } from "lucide-react";
import type { Article } from "@/lib/articles";

type Props={article:Pick<Article,"slug"|"category"|"categoryLabel"|"title">;compact?:boolean};

function artworkKind(slug:string){
 if(slug.includes("mlops"))return "mlops";
 if(slug.includes("kubernetes"))return "kubernetes";
 if(slug.includes("docker"))return "docker";
 if(slug.includes("terraform"))return "terraform";
 if(slug.includes("github"))return "github";
 if(slug.includes("git"))return "git";
 if(slug.includes("api"))return "api";
 if(slug.includes("devops")||slug.includes("ci-cd"))return "devops";
 if(slug.includes("microservices"))return "microservices";
 if(slug.includes("container")||slug.includes("virtual-machine"))return "containers";
 if(slug.includes("data-center")||slug.includes("infrastructure"))return "datacenter";
 if(slug.includes("cloud"))return "cloud";
 if(slug.includes("internet"))return "network";
 if(slug.includes("gold"))return "gold";
 if(slug.includes("etf"))return "etf";
 if(slug.includes("inflation"))return "inflation";
 if(slug.includes("interest"))return "rates";
 if(slug.includes("stock")||slug.includes("investor"))return "markets";
 if(slug.includes("agent"))return "agents";
 if(slug.includes("language-model")||slug.includes("generative"))return "llm";
 if(slug.includes("chip")||slug.includes("compute"))return "chip";
 return "default";
}
function KubernetesMark(){return <svg viewBox="0 0 64 64" className="topic-logo" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="4"/><circle cx="32" cy="32" r="6" fill="currentColor"/><g stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M32 8v14M32 42v14M8 32h14M42 32h14M15 15l10 10M39 39l10 10M49 15L39 25M25 39L15 49"/></g></svg>}
function DockerMark(){return <svg viewBox="0 0 72 56" className="topic-logo" aria-hidden="true"><g fill="currentColor"><rect x="14" y="16" width="9" height="9" rx="1"/><rect x="25" y="16" width="9" height="9" rx="1"/><rect x="36" y="16" width="9" height="9" rx="1"/><rect x="25" y="5" width="9" height="9" rx="1"/><rect x="36" y="5" width="9" height="9" rx="1"/><path d="M10 28h42c1-5 5-8 11-8-1 5-3 8-7 10-1 13-10 20-25 20C18 50 9 43 7 32c0-2 1-3 3-4Z"/></g></svg>}
function TerraformMark(){return <svg viewBox="0 0 64 64" className="topic-logo" aria-hidden="true"><g fill="currentColor"><path d="M10 10 27 20v20L10 30Z"/><path d="m29 20 17-10v20L29 40Z"/><path d="m29 43 17-10v20L29 63Z"/><path d="m48 10 10 6v20l-10-6Z"/></g></svg>}
function ApiMark(){return <svg viewBox="0 0 64 64" className="topic-logo" aria-hidden="true"><path d="M21 19 9 32l12 13M43 19l12 13-12 13M38 10 26 54" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
const TopicIcon=({kind}:{kind:string})=>{const p={size:48,strokeWidth:1.7};switch(kind){case"mlops":return <Workflow {...p}/>;case"kubernetes":return <KubernetesMark/>;case"docker":return <DockerMark/>;case"terraform":return <TerraformMark/>;case"github":return <Github {...p}/>;case"git":return <GitBranch {...p}/>;case"api":return <ApiMark/>;case"devops":return <ServerCog {...p}/>;case"microservices":return <Network {...p}/>;case"containers":return <Container {...p}/>;case"datacenter":return <Database {...p}/>;case"cloud":return <Cloud {...p}/>;case"network":return <Globe2 {...p}/>;case"gold":return <Coins {...p}/>;case"etf":return <ChartCandlestick {...p}/>;case"inflation":case"rates":return <TrendingUp {...p}/>;case"markets":return <ChartCandlestick {...p}/>;case"agents":return <Bot {...p}/>;case"llm":return <BrainCircuit {...p}/>;case"chip":return <Cpu {...p}/>;default:return <Sparkles {...p}/>;}};
function Scene({kind}:{kind:string}){if(kind==="mlops")return <><div className="scene-service s1"/><div className="scene-service s2"/><div className="scene-service s3"/><div className="scene-service s4"/><div className="scene-connector x1"/><div className="scene-connector x2"/><div className="scene-code">ML<br/>CI<br/>OPS</div></>;if(kind==="kubernetes")return <><div className="scene-node n1">POD</div><div className="scene-node n2">POD</div><div className="scene-node n3">POD</div><div className="scene-line l1"/><div className="scene-line l2"/><div className="scene-line l3"/></>;if(kind==="docker"||kind==="containers")return <><div className="scene-box b1"/><div className="scene-box b2"/><div className="scene-box b3"/><div className="scene-box b4"/></>;if(kind==="terraform")return <><div className="scene-cube c1"/><div className="scene-cube c2"/><div className="scene-cube c3"/></>;if(kind==="git"||kind==="github"||kind==="devops")return <><div className="scene-branch"><span/><span/><span/></div><div className="scene-code">01<br/>10<br/>01</div></>;if(kind==="api"||kind==="microservices"||kind==="network")return <><div className="scene-service s1"/><div className="scene-service s2"/><div className="scene-service s3"/><div className="scene-service s4"/><div className="scene-connector x1"/><div className="scene-connector x2"/></>;if(kind==="datacenter"||kind==="cloud"||kind==="chip")return <><div className="scene-rack r1"/><div className="scene-rack r2"/><div className="scene-rack r3"/><div className="scene-light"/></>;if(kind==="gold")return <><div className="scene-gold g1"/><div className="scene-gold g2"/><div className="scene-gold g3"/></>;if(kind==="etf")return <><div className="scene-chart"><i/><i/><i/><i/></div><div className="scene-pie"/></>;if(kind==="inflation"||kind==="rates"||kind==="markets")return <><div className="scene-chart"><i/><i/><i/><i/><i/></div><div className="scene-arrow"/></>;if(kind==="agents"||kind==="llm")return <><div className="scene-ai-core"/><div className="scene-ai-dot d1"/><div className="scene-ai-dot d2"/><div className="scene-ai-dot d3"/></>;return <div className="scene-default"/>;}
const labelFor=(kind:string)=>({mlops:"MLOps",kubernetes:"Kubernetes",docker:"Docker",terraform:"Terraform",github:"GitHub",git:"Git",api:"API",devops:"DevOps",microservices:"Microservices",containers:"Containers",datacenter:"Data Center",cloud:"Cloud",network:"Network",gold:"Gold",etf:"ETF",inflation:"Inflation",rates:"Rates",markets:"Markets",agents:"AI Agents",llm:"Generative AI",chip:"Compute"}[kind]??"KitsuWire");
export function ArticleArtwork({article,compact=false}:Props){const kind=artworkKind(article.slug);return <div className={`article-artwork artwork-${article.category} artwork-${kind}${compact?" is-compact":""}`} role="img" aria-label={`${labelFor(kind)} illustration for ${article.title}`}><div className="art-grid"/><div className="art-glow"/><Scene kind={kind}/><div className="art-icon"><TopicIcon kind={kind}/></div><div className="art-label"><span>{article.categoryLabel}</span><strong>{labelFor(kind)}</strong></div></div>}
