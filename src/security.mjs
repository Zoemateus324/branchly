import {randomBytes,scrypt as rawScrypt,timingSafeEqual,createHash,createHmac,createCipheriv,createDecipheriv} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(rawScrypt);
export const token=()=>randomBytes(32).toString('hex');
export const digest=x=>createHash('sha256').update(x).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');return `${salt}:${(await scrypt(password,salt,64)).toString('hex')}`;}
export async function verifyPassword(password,hash){try{const [salt,key]=hash.split(':');const supplied=await scrypt(password,salt,64);const expected=Buffer.from(key,'hex');return expected.length===supplied.length&&timingSafeEqual(expected,supplied);}catch{return false;}}
export function secureEqual(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);}
export function verifyMeta(raw,header,secret){return !!secret&&secureEqual(header,`sha256=${createHmac('sha256',secret).update(raw).digest('hex')}`);}
function key(){const k=Buffer.from(process.env.ENCRYPTION_KEY||'','base64');if(k.length!==32)throw Object.assign(new Error('Configure a chave de criptografia no servidor.'),{status:503});return k;}
export function encrypt(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);return [iv.toString('base64'),cipher.update(value,'utf8','base64')+cipher.final('base64'),cipher.getAuthTag().toString('base64')].join('.');}
export function decrypt(value){const [iv,data,tag]=value.split('.'),dec=createDecipheriv('aes-256-gcm',key(),Buffer.from(iv,'base64'));dec.setAuthTag(Buffer.from(tag,'base64'));return dec.update(data,'base64','utf8')+dec.final('utf8');}
export function parseCSV(input){const text=input.replace(/^\uFEFF/,'');let rows=[],row=[],field='',quoted=false;const sep=text.split(/\r?\n/)[0].includes(';')?';':',';for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(quoted||field==='')quoted=!quoted;else throw new Error('Aspas inválidas no CSV.');}else if(c===sep&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}if(quoted)throw new Error('CSV com aspas não fechadas.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;}
export function moneyToCents(value){if(typeof value!=='string'||!/^\d{1,9}(\.\d{1,2})?$/.test(value))throw new Error('Informe um valor válido, com ponto decimal.');const [units,cents='']=value.split('.');return Number(units)*100+Number(cents.padEnd(2,'0'));}
export function safeCSV(value){const v=String(value??'');return '"'+(/^[\s]*[=+@\-\t\r]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';}
