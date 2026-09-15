import {PrismaClient,Role,Sentiment,FeedbackStatus} from '@prisma/client';
import bcrypt from 'bcryptjs';
const db=new PrismaClient();
const templates=[
 ['Support ticket','Negative','Onboarding took forever — I could not figure out how to invite my team.','onboarding','NEG',-0.86],
 ['App store review','Positive','The new dashboard is gorgeous and finally fast. Huge improvement.','dashboard','POS',0.88],
 ['NPS survey','Neutral','It does the job, but the mobile experience needs work.','mobile','NEU',0.05],
 ['Sales call note','Negative','Prospect wants SSO before they will sign — this came up again this month.','security','NEG',-0.7],
 ['Community post','Positive','Love the new export feature, it saved me an hour today.','exports','POS',0.82],
 ['Support ticket','Negative','Billing page keeps timing out when I try to download an invoice.','billing','NEG',-0.8],
 ['Support ticket','Negative','Search misses older conversations and makes triage frustrating.','search','NEG',-0.62],
 ['NPS survey','Positive','Our team is getting value from the weekly insights digest.','reports','POS',0.76],
 ['Community post','Neutral','Would be useful to customize dashboard widgets for each team.','dashboard','NEU',0.1],
 ['App store review','Negative','The latest update made notifications unreliable.','notifications','NEG',-0.68],
 ['Sales call note','Positive','The API documentation was clear and integration was quick.','api','POS',0.72],
 ['Support ticket','Negative','CSV import failed on a file with commas in customer names.','imports','NEG',-0.58],
];
const extra=[
 'Users keep asking for better onboarding guidance and clearer invite steps.',
 'Customers praise the dashboard speed but want more customization.',
 'Several teams report mobile layout issues on smaller screens.',
 'Multiple prospects say SSO and stronger access controls are purchase blockers.',
 'Customers want exports to support more formats and scheduled delivery.',
 'Billing complaints mention slow invoice downloads and confusing errors.',
 'Search quality is a recurring frustration for support teams.',
 'Teams want reports that are easier to share with leadership.',
 'Notification preferences are hard to discover and configure.',
 'The API is appreciated, with requests for more examples and webhooks.',
 'CSV ingestion needs clearer validation messages and duplicate handling.',
 'Customers want integrations with more support and review channels.'
];
async function main(){
 await db.feedbackTheme.deleteMany();await db.embedding.deleteMany();await db.report.deleteMany();await db.feedback.deleteMany();await db.theme.deleteMany();await db.user.deleteMany();await db.workspace.deleteMany();
 const workspace=await db.workspace.create({data:{name:'Northstar Labs'}});
 const password=await bcrypt.hash('LoopDemo@2026',12);
 await db.user.createMany({data:[
  {name:'Ava Admin',email:'admin@loop.demo',passwordHash:password,role:Role.ADMIN,workspaceId:workspace.id},
  {name:'Noah Analyst',email:'analyst@loop.demo',passwordHash:password,role:Role.ANALYST,workspaceId:workspace.id},
  {name:'Mia Viewer',email:'viewer@loop.demo',passwordHash:password,role:Role.VIEWER,workspaceId:workspace.id}
 ]});
 const themeNames=['Onboarding','Dashboard UX','Mobile Experience','Security & SSO','Exports','Billing','Search','Reporting','Notifications','API & Integrations','Imports'];
 const themes:any[]=[];for(const name of themeNames) themes.push(await db.theme.create({data:{name,description:`Customer feedback related to ${name.toLowerCase()}.`,workspaceId:workspace.id}}));
 const rows=[];
 for(let i=0;i<144;i++){
   const base=templates[i%templates.length];const variation=extra[i%extra.length];
   const content=String(i%3===0?base[2]:variation);
   const date=new Date();date.setDate(date.getDate()-(i%42));date.setHours(9+(i%9),i%60,0,0);
   rows.push({content,channel:String(base[0]),customerLabel:`Customer ${String((i%28)+1).padStart(2,'0')}`,sentiment:base[4] as Sentiment,sentimentScore:Number(base[5]),featureArea:String(base[3]),aiRationale:`Matched to ${base[3]} signals in the feedback text.`,status:(i%7===0?'ACTIONED':i%3===0?'REVIEWED':'NEW') as FeedbackStatus,createdAt:date,workspaceId:workspace.id,sourceRef:`seed-${i+1}`});
 }
 const created=await db.$transaction(rows.map(r=>db.feedback.create({data:r})));
 for(let i=0;i<created.length;i++){
   const f=created[i];const t=themes[i%themes.length];
   await db.feedbackTheme.create({data:{feedbackId:f.id,themeId:t.id,confidence:0.72+(i%25)/100}});
   const words=f.content.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);const vec=Array.from({length:64},()=>0);for(const w of words){let h=0;for(let j=0;j<w.length;j++)h=((h<<5)-h+w.charCodeAt(j))|0;vec[Math.abs(h)%64]+=1;}const norm=Math.sqrt(vec.reduce((a,b)=>a+b*b,0))||1;await db.embedding.create({data:{feedbackId:f.id,vector:vec.map(v=>v/norm)}});
 }
 console.log('Seeded demo workspace:',workspace.id,'feedback:',created.length);
 console.log('Demo login: admin@loop.demo / LoopDemo@2026');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());
