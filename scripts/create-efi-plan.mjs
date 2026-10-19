import {efi,efiEnvironment} from '../src/efi.mjs';
if(process.env.EFI_ENV==='production'&&process.env.EFI_ALLOW_PLAN_CREATION!=='1')throw new Error('Para criar plano em produção, defina EFI_ALLOW_PLAN_CREATION=1 explicitamente.');
const result=await efi('/plan','POST',{name:'Branchly Mensal',interval:1});
console.log(JSON.stringify({environment:efiEnvironment(),plan_id:result.data?.plan_id}));
