begin;
insert into auth.users(id,email,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000001','alice@example.test',now()),
 ('10000000-0000-4000-8000-000000000002','bob@example.test',now()),
 ('10000000-0000-4000-8000-000000000003','member@example.test',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.branchly_bootstrap('Alice','Empresa A');
insert into public.branchly_proposals(org_id,client,title,value_cents) values(private.branchly_org(),'Cliente da Alice','Instalação',10000);
do $$ begin
 if (select count(*) from public.branchly_proposals)<>1 then raise exception 'Owner cannot read own data'; end if;
 begin
  update public.branchly_organizations set access_until=now()+interval '10 years';
  raise exception 'Billing escalation accepted';
 exception when insufficient_privilege then null; end;
 begin
  update public.branchly_profiles set org_id=gen_random_uuid();
  raise exception 'Tenant escalation accepted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select public.branchly_bootstrap('Bob','Empresa B');
do $$ begin
 if (select count(*) from public.branchly_proposals)<>0 then raise exception 'Cross tenant data leak'; end if;
 if (select count(*) from public.branchly_profiles)<>1 then raise exception 'Cross tenant profile leak'; end if;
 begin
  insert into public.branchly_proposals(org_id,client,title,value_cents) values('00000000-0000-4000-8000-000000000099','Attacker','Injected',1);
  raise exception 'Cross tenant insert accepted';
 exception when insufficient_privilege then null; end;
 begin
  select * from private.branchly_integrations;
  raise exception 'Integration secret leak';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.branchly_profiles(id,org_id,name,email,role)
 select '10000000-0000-4000-8000-000000000003',org_id,'Membro','member@example.test','member'
 from public.branchly_profiles where id='10000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$ declare deleted integer; begin
 delete from public.branchly_proposals;
 get diagnostics deleted=row_count;
 if deleted<>0 then raise exception 'Member deleted owner data'; end if;
 if (select count(*) from public.branchly_proposals)<>1 then raise exception 'Member cannot read own workspace'; end if;
 begin
  update public.branchly_profiles set role='owner';
  raise exception 'Role escalation accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin
  select * from public.branchly_proposals;
  raise exception 'Anonymous data leak';
 exception when insufficient_privilege then null; end;
 begin
  perform public.branchly_bootstrap('Anonymous','Forbidden');
  raise exception 'Anonymous workspace creation accepted';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
