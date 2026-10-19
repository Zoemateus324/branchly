// Keep the persistent backend separate from Vercel's ephemeral function filesystem.
export default async function handler(request,response){
 const base=process.env.BACKEND_ORIGIN;
 response.setHeader('Cache-Control','no-store');
 if(!base){response.statusCode=503;response.setHeader('Content-Type','application/json; charset=utf-8');return response.end(JSON.stringify({error:'O acesso à conta aguarda a conexão do backend. Você já pode explorar a demonstração pública.'}));}
 let origin;try{origin=new URL(base);if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error();}catch{response.statusCode=503;return response.end(JSON.stringify({error:'A configuração do backend precisa de uma origem HTTPS válida.'}));}
 const incoming=new URL(request.url,'https://branchly.invalid');const route=incoming.searchParams.get('route')||'';
 if(!/^[a-zA-Z0-9/_-]+$/.test(route)||route.split('/').some(part=>part==='.'||part==='..')||route.startsWith('/')){response.statusCode=400;return response.end(JSON.stringify({error:'Rota inválida.'}));}
 incoming.searchParams.delete('route');const destination=new URL('/api/'+route,origin);destination.search=incoming.searchParams.toString();
 try{const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>1024*1024){response.statusCode=413;return response.end(JSON.stringify({error:'Limite de 1 MB por requisição.'}));}chunks.push(chunk);}const headers={};for(const name of ['content-type','cookie','origin','x-hub-signature-256']){const value=request.headers[name];if(typeof value==='string')headers[name]=value;}
 const result=await fetch(destination,{method:request.method,headers,redirect:'manual',signal:AbortSignal.timeout(25000),...(!['GET','HEAD'].includes(request.method)?{body:Buffer.concat(chunks)}:{})});
 response.statusCode=result.status;response.setHeader('Content-Type',result.headers.get('content-type')||'application/json; charset=utf-8');const cookies=result.headers.getSetCookie();if(cookies.length)response.setHeader('Set-Cookie',cookies);response.end(Buffer.from(await result.arrayBuffer()));
 }catch{response.statusCode=502;response.setHeader('Content-Type','application/json; charset=utf-8');response.end(JSON.stringify({error:'Não foi possível conectar ao backend. Tente novamente em instantes.'}));}
}
