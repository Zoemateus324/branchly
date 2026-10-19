import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';import {dirname} from 'node:path';import {randomUUID} from 'node:crypto';
export const uid=()=>randomUUID();
const file=process.env.DATABASE_PATH||'./data/branchly.sqlite';if(file!==':memory:')mkdirSync(dirname(file),{recursive:true,mode:0o700});
export const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS organizations(id TEXT PRIMARY KEY,name TEXT NOT NULL,billing_status TEXT NOT NULL DEFAULT 'trial',access_until INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'owner',verified INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS auth_tokens(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),client TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',title TEXT NOT NULL,value_cents INTEGER NOT NULL CHECK(value_cents>=0),status TEXT NOT NULL DEFAULT 'sent',next_date TEXT,notes TEXT NOT NULL DEFAULT '',opt_in INTEGER NOT NULL DEFAULT 0,last_inbound INTEGER,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS proposals_org ON proposals(org_id,status);
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),proposal_id TEXT REFERENCES proposals(id) ON DELETE CASCADE,title TEXT NOT NULL,due_date TEXT NOT NULL,done INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),user_id TEXT,event TEXT NOT NULL,detail TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS integrations(org_id TEXT NOT NULL REFERENCES organizations(id),provider TEXT NOT NULL,secret TEXT NOT NULL,PRIMARY KEY(org_id,provider));
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),proposal_id TEXT NOT NULL REFERENCES proposals(id),channel TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL,provider_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS ai_usage(org_id TEXT NOT NULL,day TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(org_id,day));
CREATE TABLE IF NOT EXISTS billing_orders(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),environment TEXT NOT NULL,plan TEXT NOT NULL,charge_id TEXT NOT NULL,subscription_id TEXT,amount_cents INTEGER NOT NULL,status TEXT NOT NULL,subscription_status TEXT,payment_url TEXT NOT NULL,created_ms INTEGER NOT NULL,granted_until INTEGER,UNIQUE(environment,charge_id));
CREATE TABLE IF NOT EXISTS funnel_events(id TEXT PRIMARY KEY,event TEXT NOT NULL,org_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS invitations(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organizations(id),email TEXT NOT NULL,expires INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
`);
export const run=(q,...args)=>db.prepare(q).run(...args);
export const one=(q,...args)=>db.prepare(q).get(...args);
export const all=(q,...args)=>db.prepare(q).all(...args);
export function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
export const audit=(org,user,event,detail='')=>run('INSERT INTO audit(id,org_id,user_id,event,detail) VALUES(?,?,?,?,?)',uid(),org,user,event,detail);
export const summary=org=>one(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN status NOT IN ('won','lost') THEN value_cents ELSE 0 END),0) pipeline,COALESCE(SUM(CASE WHEN status='won' THEN value_cents ELSE 0 END),0) won,COALESCE(SUM(CASE WHEN status NOT IN ('won','lost') AND next_date<=date('now','-3 hours') THEN 1 ELSE 0 END),0) overdue FROM proposals WHERE org_id=?`,org);
