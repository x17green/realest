import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "RealEST Connect <info@connect.realest.ng>";
const CODE = "ADEEDDAFMKS";

const addresses = `lucindasmith7291@gmail.com,marcusrodriguez5042@gmail.com,felicitynguyen9015@gmail.com,donovanwilliams2876@gmail.com,cynthiawilson6329@gmail.com,elliotthughes4158@gmail.com,mackenzieparker92032@gmail.com,lincolnadams5634@gmail.com,isabellahall3816@gmail.com,gabrielcooper8973@gmail.com,paigebrown6148@gmail.com,zacharythompson2847@gmail.com,emilysanchez4791@gmail.com,owenrussell7921@gmail.com,carterbutler5682@gmail.com,averymartin4018@gmail.com,lilygonzalez8261@gmail.com,ethanmurphy9407@gmail.com,savannahturner6053@gmail.com,hudsonwright4196@gmail.com,nataliehill7281@gmail.com,jacobroberts58291@gmail.com,zoeycollins9087@gmail.com,dylanmorris2547@gmail.com,madelinecook6398@gmail.com,owenjackson7015@gmail.com,audreymorgan1285@gmail.com,noahwoodward9456@gmail.com,clairekelly3769@gmail.com,brooklynrogers2937@gmail.com,ronaldtaylor1265@mail.ru,lindadavis451@mail.ru,torben.russel@yandex.ru,karan.bell@yandex.ru,team-ed@m365.easydmarc.com,team-ed@m365.easydmarc.co.uk,team-ed@m365.easydmarc.nl,team-ed@m365.easydmarc.email,team-ed@m365.easydmarc.help,jonathan.shumacher@freenet.de,easydmarc@interia.pl,clarapearce16@aol.com,victoryoung939@aol.com,holmes_abel@aol.com,lucidodson585@aol.com,westemily343@aol.com,adalinemcintosh69@aol.com,leejack380@aol.com,ed-global@seznam.cz,ed-global2@seznam.cz,easydmarc@sfr.fr,hag@checkphishing.com,ed-global@workmail.easydmarc.com,ed-global2@workmail.easydmarc.com,amayathompson6274@gmx.com,finleyroberts9501@gmx.com,arianawalker3816@gmx.com,asherrussell7192@gmx.com,adrianawilson5031@gmx.com,lucahamilton2954@gmx.com,elliebutler6109@gmx.com,xaviercook1982@gmx.com,skylarhughes5287@gmx.com,oliverrodriguez8173@gmx.com,evelynedwards6947@gmx.com,elliotprice4138@gmx.com,saranichols8625@gmx.com,milesward2517@gmx.com,paigehoward2421@gmx.com,ziggybeltran@yahoo.com,myers.ridley@yahoo.com,aiylacortes@yahoo.com,miller.burton35@yahoo.com,sandy.allen7663@yahoo.com,burriscassidy156@yahoo.com,hillnancy886@yahoo.com,fitzpatrickedgar@yahoo.com,ed-global@op.pl,ed-global@onet.pl,team-ed@dmarc.am,team-ed@easydmarc.co.uk,team-ed@easydmarc.email,team-ed@easydmarc.help,team-ed@easydmarc.nl,norawoodard6719@zohomail.com,henrymartinez2864@zohomail.com,leohenderson1295@zohomail.com,jackcoleman2964@zohomail.com,harperroberts9350@zohomail.com,sydneypeterson9012@zohomail.com,evabennett2045@zohomail.com,julianramirez4758@zohomail.com,arielturner5704@zohomail.com,ivycollins6097@zohomail.com,ed-global@libero.it,vincentmarshall9240@outlook.com,sophiawright1707@outlook.com,nataliemorris4018@outlook.com,lucasrivera5629@outlook.com,camillemurray5964@outlook.com,alexandergreen31867@outlook.com,ameliawilson5167@outlook.com,isaacperry6239@outlook.com,zarahamilton3196@outlook.com,sebastiansanders4862@outlook.com,elisabethpowell7854@outlook.com,joshuarobinson1629@outlook.com,madisonharris4185@outlook.com,jonathanrodriguez7549@outlook.com,benjaminprice2195@outlook.com,lillianwoodard64191@outlook.com,elijahbailey39781@outlook.com,scarlettcoleman6237@outlook.com,victoriaroberts85075@outlook.com,ryangonzalez2164@outlook.com,easydmarc@laposte.net,hkhatchoian@icloud.com,ed-global@bluetiehome.com,ed-global@centrum.cz,easydmarc@free.fr,jonathan.shumacher@web.de,ed-global@att.net,jonathan.shumacher@t-online.de,jonathan.shumacher@gmx.de`
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// Resend allows up to 50 recipients per send call
const BATCH_SIZE = 50;
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const batches = chunk(addresses, BATCH_SIZE);
console.log(`Sending to ${addresses.length} addresses in ${batches.length} batch(es)...`);

let sent = 0;
let failed = 0;

for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: batch,
    subject: "RealEST — Email Deliverability Test",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#07402F;">RealEST Email Deliverability Test</h2>
      <p>This is an automated deliverability test email sent from <strong>RealEST Connect</strong>.</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#07402F;">${CODE}</p>
      <p style="color:#666;font-size:12px;">Sent from connect.realest.ng via Resend</p>
    </div>`,
    text: `RealEST Email Deliverability Test\n\nTest code: ${CODE}\n\nSent from connect.realest.ng via Resend`,
  });

  if (error) {
    console.error(`Batch ${i + 1}/${batches.length} FAILED:`, error.message);
    failed += batch.length;
  } else {
    console.log(`Batch ${i + 1}/${batches.length} sent ✅  id: ${data?.id}  (${batch.length} recipients)`);
    sent += batch.length;
  }

  // Brief pause between batches to stay within rate limits
  if (i < batches.length - 1) await new Promise(r => setTimeout(r, 300));
}

console.log(`\nDone. Sent: ${sent} | Failed: ${failed}`);
