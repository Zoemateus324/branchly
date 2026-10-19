begin;
create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.branchly_organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 1 and 150),
 billing_status text not null default 'trial',
 access_until timestamptz not null default now()+interval '7 days',
 created_at timestamptz not null default now()
);
create table if not exists public.branchly_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 org_id uuid not null references public.branchly_organizations(id),
 name text not null check(char_length(name) between 1 and 100),
 email text not null,
 role text not null default 'member' check(role in ('owner','member')),
 created_at timestamptz not null default now()
);
create index if not exists branchly_profiles_org on public.branchly_profiles(org_id);
create table if not exists public.branchly_proposals (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.branchly_organizations(id),
 client text not null check(char_length(client) between 1 and 160),
 title text not null check(char_length(title) between 1 and 200),
 email text not null default '',phone text not null default '',
 value_cents bigint not null check(value_cents between 0 and 99999999999),
 status text not null default 'sent' check(status in ('sent','contact','negotiation','won','lost')),
 next_date date,notes text not null default '' check(char_length(notes)<=3000),
 opt_in boolean not null default false,last_inbound bigint,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(org_id,id)
);
create index if not exists branchly_proposals_org on public.branchly_proposals(org_id,status);
create table if not exists public.branchly_tasks (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.branchly_organizations(id),proposal_id uuid,
 title text not null check(char_length(title) between 1 and 200),due_date date not null,done boolean not null default false,
 created_at timestamptz not null default now(),
 foreign key(org_id,proposal_id) references public.branchly_proposals(org_id,id) on delete cascade
);
create index if not exists branchly_tasks_org on public.branchly_tasks(org_id,due_date);
create table if not exists public.branchly_audit (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.branchly_organizations(id),
 user_id uuid references auth.users(id) on delete set null,event text not null,detail text not null default '',created_at timestamptz not null default now()
);
create index if not exists branchly_audit_org on public.branchly_audit(org_id,created_at desc);
create table if not exists public.branchly_messages (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.branchly_organizations(id),proposal_id uuid not null,
 channel text not null,body text not null,status text not null,provider_id text,created_at timestamptz not null default now(),
 foreign key(org_id,proposal_id) references public.branchly_proposals(org_id,id) on delete cascade
);
create table if not exists private.branchly_integrations (
 org_id uuid not null references public.branchly_organizations(id),provider text not null,secret text not null,
 primary key(org_id,provider)
);
create table if not exists private.branchly_invitations (
 id text primary key,org_id uuid not null references public.branchly_organizations(id),email text not null,
 expires timestamptz not null default now()+interval '24 hours'
);
create table if not exists private.branchly_ai_usage (
 org_id uuid not null references public.branchly_organizations(id),day date not null,count integer not null default 0,
 primary key(org_id,day)
);
create table if not exists public.branchly_billing_orders (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.branchly_organizations(id),
 environment text not null check(environment in ('sandbox','production')),plan text not null check(plan in ('pilot','subscription')),
 charge_id text not null,subscription_id text,amount_cents integer not null,status text not null,
 subscription_status text,payment_url text not null default '',created_ms bigint not null,granted_until timestamptz,
 unique(environment,charge_id)
);
create table if not exists private.branchly_webhook_events(id text primary key,created_at timestamptz not null default now());

create or replace function private.branchly_org() returns uuid language sql stable security definer set search_path='' as $$
 select org_id from public.branchly_profiles where id=(select auth.uid());
$$;
create or replace function private.branchly_owner() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select role='owner' from public.branchly_profiles where id=(select auth.uid())),false);
$$;
create or replace function private.branchly_can_write() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select access_until>now() from public.branchly_organizations where id=private.branchly_org()),false);
$$;
revoke all on function private.branchly_org(),private.branchly_owner(),private.branchly_can_write() from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.branchly_org(),private.branchly_owner(),private.branchly_can_write() to authenticated;

create or replace function public.branchly_bootstrap(p_name text,p_company text,p_invitation_token text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare organization_id uuid; account_email text; invitation private.branchly_invitations; account_confirmed timestamptz;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select org_id into organization_id from public.branchly_profiles where id=auth.uid();
 if organization_id is not null then return organization_id; end if;
 select email,email_confirmed_at into account_email,account_confirmed from auth.users where id=auth.uid();
 if char_length(trim(p_name)) not between 1 and 100 or char_length(trim(p_company)) not between 1 and 150 then raise exception 'Invalid profile'; end if;
 if p_invitation_token is not null then
  select * into invitation from private.branchly_invitations where id=encode(extensions.digest(p_invitation_token,'sha256'),'hex') for update;
  if invitation.id is null or invitation.expires<now() or lower(invitation.email)<>lower(account_email) or account_confirmed is null then raise exception 'Invalid invitation'; end if;
  perform 1 from public.branchly_organizations where id=invitation.org_id for update;
  if (select count(*) from public.branchly_profiles where org_id=invitation.org_id)>=3 then raise exception 'Team limit reached'; end if;
  organization_id:=invitation.org_id;
  insert into public.branchly_profiles(id,org_id,name,email,role) values(auth.uid(),organization_id,trim(p_name),account_email,'member');
  delete from private.branchly_invitations where id=invitation.id;
 else
  insert into public.branchly_organizations(name) values(trim(p_company)) returning id into organization_id;
  insert into public.branchly_profiles(id,org_id,name,email,role) values(auth.uid(),organization_id,trim(p_name),account_email,'owner');
 end if;
 insert into public.branchly_audit(org_id,user_id,event) values(organization_id,auth.uid(),'Conta vinculada ao workspace');
 return organization_id;
end;
$$;
revoke all on function public.branchly_bootstrap(text,text,text) from public,anon;
grant execute on function public.branchly_bootstrap(text,text,text) to authenticated;

create or replace function private.branchly_proposal_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  perform 1 from public.branchly_organizations where id=new.org_id for update;
  if (select count(*) from public.branchly_proposals where org_id=new.org_id)>=2000 then raise exception 'Proposal limit reached'; end if;
 else
  new.org_id:=old.org_id;new.created_at:=old.created_at;new.last_inbound:=old.last_inbound;new.updated_at:=now();
 end if;
 return new;
end;
$$;
drop trigger if exists branchly_proposal_guard on public.branchly_proposals;
create trigger branchly_proposal_guard before insert or update on public.branchly_proposals for each row execute function private.branchly_proposal_guard();

create or replace function private.branchly_record_change() returns trigger language plpgsql security definer set search_path='' as $$
declare entity jsonb; label text;
begin
 entity:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 label:=case tg_table_name when 'branchly_proposals' then 'Orçamento' when 'branchly_tasks' then 'Tarefa' else 'Perfil' end;
 insert into public.branchly_audit(org_id,user_id,event,detail) values((entity->>'org_id')::uuid,auth.uid(),label||' · '||lower(tg_op),coalesce(entity->>'title',entity->>'name',''));
 return null;
end;
$$;
drop trigger if exists branchly_proposal_audit on public.branchly_proposals;
create trigger branchly_proposal_audit after insert or update or delete on public.branchly_proposals for each row execute function private.branchly_record_change();
drop trigger if exists branchly_task_audit on public.branchly_tasks;
create trigger branchly_task_audit after insert or update or delete on public.branchly_tasks for each row execute function private.branchly_record_change();

alter table public.branchly_organizations enable row level security;
alter table public.branchly_profiles enable row level security;
alter table public.branchly_proposals enable row level security;
alter table public.branchly_tasks enable row level security;
alter table public.branchly_audit enable row level security;
alter table public.branchly_messages enable row level security;
alter table public.branchly_billing_orders enable row level security;
alter table private.branchly_integrations enable row level security;
alter table private.branchly_invitations enable row level security;
alter table private.branchly_ai_usage enable row level security;
alter table private.branchly_webhook_events enable row level security;

revoke all on public.branchly_organizations,public.branchly_profiles,public.branchly_proposals,public.branchly_tasks,public.branchly_audit,public.branchly_messages,public.branchly_billing_orders from anon,authenticated;
revoke all on all tables in schema private from anon,authenticated;
grant select on public.branchly_organizations,public.branchly_profiles,public.branchly_proposals,public.branchly_tasks,public.branchly_audit,public.branchly_messages,public.branchly_billing_orders to authenticated;
grant update(name) on public.branchly_organizations,public.branchly_profiles to authenticated;
grant insert(org_id,client,title,email,phone,value_cents,status,next_date,notes,opt_in) on public.branchly_proposals to authenticated;
grant update(client,title,email,phone,value_cents,status,next_date,notes,opt_in) on public.branchly_proposals to authenticated;
grant delete on public.branchly_proposals to authenticated;
grant insert(org_id,proposal_id,title,due_date,done) on public.branchly_tasks to authenticated;
grant update(title,due_date,done) on public.branchly_tasks to authenticated;
grant delete on public.branchly_tasks to authenticated;

-- Explicit policies avoid exposing either another company or protected billing columns.
drop policy if exists branchly_org_read on public.branchly_organizations;
create policy branchly_org_read on public.branchly_organizations for select to authenticated using(id=(select private.branchly_org()));
drop policy if exists branchly_org_update on public.branchly_organizations;
create policy branchly_org_update on public.branchly_organizations for update to authenticated using(id=(select private.branchly_org()) and (select private.branchly_owner())) with check(id=(select private.branchly_org()));
drop policy if exists branchly_profile_read on public.branchly_profiles;
create policy branchly_profile_read on public.branchly_profiles for select to authenticated using(org_id=(select private.branchly_org()));
drop policy if exists branchly_profile_update on public.branchly_profiles;
create policy branchly_profile_update on public.branchly_profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
drop policy if exists branchly_proposal_read on public.branchly_proposals;
create policy branchly_proposal_read on public.branchly_proposals for select to authenticated using(org_id=(select private.branchly_org()));
drop policy if exists branchly_proposal_insert on public.branchly_proposals;
create policy branchly_proposal_insert on public.branchly_proposals for insert to authenticated with check(org_id=(select private.branchly_org()) and (select private.branchly_can_write()));
drop policy if exists branchly_proposal_update on public.branchly_proposals;
create policy branchly_proposal_update on public.branchly_proposals for update to authenticated using(org_id=(select private.branchly_org()) and (select private.branchly_can_write())) with check(org_id=(select private.branchly_org()));
drop policy if exists branchly_proposal_delete on public.branchly_proposals;
create policy branchly_proposal_delete on public.branchly_proposals for delete to authenticated using(org_id=(select private.branchly_org()) and (select private.branchly_owner()) and (select private.branchly_can_write()));
drop policy if exists branchly_task_read on public.branchly_tasks;
create policy branchly_task_read on public.branchly_tasks for select to authenticated using(org_id=(select private.branchly_org()));
drop policy if exists branchly_task_insert on public.branchly_tasks;
create policy branchly_task_insert on public.branchly_tasks for insert to authenticated with check(org_id=(select private.branchly_org()) and (select private.branchly_can_write()));
drop policy if exists branchly_task_update on public.branchly_tasks;
create policy branchly_task_update on public.branchly_tasks for update to authenticated using(org_id=(select private.branchly_org()) and (select private.branchly_can_write())) with check(org_id=(select private.branchly_org()));
drop policy if exists branchly_task_delete on public.branchly_tasks;
create policy branchly_task_delete on public.branchly_tasks for delete to authenticated using(org_id=(select private.branchly_org()) and (select private.branchly_can_write()));
drop policy if exists branchly_audit_read on public.branchly_audit;
create policy branchly_audit_read on public.branchly_audit for select to authenticated using(org_id=(select private.branchly_org()));
drop policy if exists branchly_message_read on public.branchly_messages;
create policy branchly_message_read on public.branchly_messages for select to authenticated using(org_id=(select private.branchly_org()));
drop policy if exists branchly_billing_read on public.branchly_billing_orders;
create policy branchly_billing_read on public.branchly_billing_orders for select to authenticated using(org_id=(select private.branchly_org()) and (select private.branchly_owner()));

create or replace function public.branchly_consume_ai(p_limit integer default 20) returns integer language plpgsql security definer set search_path='' as $$
declare current_count integer; organization_id uuid:=private.branchly_org();
begin
 if organization_id is null or not private.branchly_can_write() then raise exception 'Access unavailable' using errcode='42501'; end if;
 insert into private.branchly_ai_usage(org_id,day,count) values(organization_id,current_date,1)
 on conflict(org_id,day) do update set count=private.branchly_ai_usage.count+1
 where private.branchly_ai_usage.count<least(greatest(p_limit,1),20) returning count into current_count;
 if current_count is null then raise exception 'Daily AI limit reached'; end if;
 return current_count;
end;
$$;
revoke all on function public.branchly_consume_ai(integer) from public,anon;
grant execute on function public.branchly_consume_ai(integer) to authenticated;

-- Trigger-only functions must not be callable as public RPCs.
revoke all on function private.branchly_proposal_guard(),private.branchly_record_change() from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
