const ADSENSE_CLIENT_RE = /^ca-pub-\d{10,20}$/;

export const dynamic = "force-dynamic";

export async function GET(){
  const rawClient=process.env.ADSENSE_CLIENT?.trim()||"";
  if(!ADSENSE_CLIENT_RE.test(rawClient)){
    return new Response("",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
  }
  const publisherId=rawClient.replace(/^ca-/,"");
  const body=`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}
