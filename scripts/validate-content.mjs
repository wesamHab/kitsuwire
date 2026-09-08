import fs from 'node:fs';
import path from 'node:path';

const categories=['ai','technology','software','markets'];
const root=path.join(process.cwd(),'content','articles');
let count=0;
for(const category of categories){
  const dir=path.join(root,category);
  if(!fs.existsSync(dir)) continue;
  for(const file of fs.readdirSync(dir).filter(name=>name.endsWith('.json'))){
    const full=path.join(dir,file);
    let article;
    try{article=JSON.parse(fs.readFileSync(full,'utf8'));}
    catch(error){throw new Error(`Invalid JSON in ${path.relative(process.cwd(),full)}: ${error.message}`)}
    for(const key of ['slug','category','categoryLabel','title','excerpt','publishedAt','readingTime','tone','body']){
      if(article[key]===undefined) throw new Error(`Missing '${key}' in ${path.relative(process.cwd(),full)}`);
    }
    if(article.category!==category) throw new Error(`Category mismatch in ${path.relative(process.cwd(),full)}`);
    if(!Array.isArray(article.body)) throw new Error(`'body' must be an array in ${path.relative(process.cwd(),full)}`);
    if(article.sections!==undefined&&!Array.isArray(article.sections)) throw new Error(`'sections' must be an array in ${path.relative(process.cwd(),full)}`);
    if(article.faq!==undefined&&!Array.isArray(article.faq)) throw new Error(`'faq' must be an array in ${path.relative(process.cwd(),full)}`);
    if(article.sources!==undefined&&!Array.isArray(article.sources)) throw new Error(`'sources' must be an array in ${path.relative(process.cwd(),full)}`);
    count++;
  }
}
console.log(`Validated ${count} KitsuWire article files successfully.`);
