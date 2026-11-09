#!/usr/bin/env python3
"""Step: wire the catering + contact forms to Web3Forms (fetch POST JSON).
Edits src/site.html only, by exact-match anchors. Stops unless every anchor is found the expected number of times.
Idempotent (2nd run says "already done"). Writes src/site.html.bak-forms first.
The access key is NOT in this file: src/site.html gets the placeholder __WEB3FORMS_KEY__ (APPLY.md swaps it in at a hidden prompt)."""
import sys, shutil, pathlib
P = pathlib.Path("src/site.html")
s = P.read_text(encoding="utf-8")
if "W3F_KEY" in s:
    print("already done"); sys.exit(0)

# (old, new, expected count)
R = []

# 1. honeypot checkbox in both forms (hidden, outside the layout)
HP = '<input type="checkbox" name="botcheck" value="1" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none"/>'
R.append(('<p class="rr-form-status cx-full" role="status" aria-live="polite" hidden></p></form>',
          HP + '<p class="rr-form-status cx-full" role="status" aria-live="polite" hidden></p></form>', 1))
R.append(('<p class="rr-form-status rr-field-full" role="status" aria-live="polite" hidden></p></form>',
          HP + '<p class="rr-form-status rr-field-full" role="status" aria-live="polite" hidden></p></form>', 1))

# 2. vals(): never read the honeypot (keeps it out of the WhatsApp text)
R.append(("function vals(f){const o={};f.querySelectorAll('input,select,textarea').forEach(e=>{if(e.name)o[e.name]=e.value.trim()});return o}",
          "function vals(f){const o={};f.querySelectorAll('input,select,textarea').forEach(e=>{if(e.name&&e.name!=='botcheck')o[e.name]=e.value.trim()});return o}", 1))

# 3. endpoint const -> Web3Forms settings + helpers
R.append(("const RR_FORM_ENDPOINT='';",
r"""const W3F_URL='https://api.web3forms.com/submit',W3F_KEY='__WEB3FORMS_KEY__';
const OK_MSG="Thank you! We'll call you within a day.";
function w3fBody(f,kind){const v=vals(f),hp=f.querySelector('input[name=botcheck]'),b={access_key:W3F_KEY,from_name:'RR Durbar website',botcheck:!!(hp&&hp.checked)};
 b.name=v.name;b.phone=v.phone;if(v.email)b.email=v.email;
 if(kind==='catering'){b.event_type=v['event type'];b.date=v['event date'];b.guests=v['guest count'];b.location=v.location;b.message=v.requirements||'';
  b.subject='[RR Durbar] Catering enquiry \u2013 '+v['event type']+' \u2013 '+v['event date']}
 else{b.topic=v.subject;b.message=v.message;b.subject='[RR Durbar] Contact \u2013 '+v.name}
 return b}
function w3fFail(f){const p=f.querySelector('.rr-form-status');if(!p)return;p.textContent='';
 p.appendChild(document.createTextNode('Sorry, your message was not sent. Please message us on '));
 const a=document.createElement('a');a.href='https://wa.me/'+WA;a.target='_blank';a.rel='noopener noreferrer';a.textContent='WhatsApp';p.appendChild(a);
 p.appendChild(document.createTextNode(' or call 98499 82052.'));p.hidden=false;p.dataset.tone='error'}""", 1))

# 4. the submit handler body
OLD = """  if(!RR_FORM_ENDPOINT){status(f,msgs[kind],'notice');return}
  busy=true;btn.disabled=true;const label=btn.textContent;btn.textContent='Sending…';status(f,'');
  try{const r=await fetch(RR_FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form:kind,fields:vals(f)})});
   if(!r.ok)throw 0;status(f,'Thank you. We have received your request and will get back to you shortly.');f.reset()}
  catch(_){status(f,'Something went wrong, so your request was not sent. Please try again, or use WhatsApp or call.','error')}
  finally{busy=false;btn.disabled=false;btn.textContent=label}});"""
NEW = """  const hp=f.querySelector('input[name=botcheck]');
  if(hp&&hp.checked){status(f,OK_MSG,'success');return}
  busy=true;btn.disabled=true;btn.setAttribute('aria-busy','true');const label=btn.textContent;btn.textContent='Sending…';status(f,'');
  try{const r=await fetch(W3F_URL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(w3fBody(f,kind))});
   const d=await r.json().catch(()=>({}));
   if(!r.ok||!d.success)throw 0;status(f,OK_MSG,'success');f.reset()}
  catch(_){w3fFail(f)}
  finally{busy=false;btn.disabled=false;btn.removeAttribute('aria-busy');btn.textContent=label}});"""
R.append((OLD, NEW, 1))

for old, new, n in R:
    c = s.count(old)
    if c != n:
        print(f"STOP: anchor found {c}x, expected {n}: {old[:70]!r}"); sys.exit(1)
shutil.copy(P, str(P) + ".bak-forms")
for old, new, n in R:
    s = s.replace(old, new)
P.write_text(s, encoding="utf-8")
print("patched: 2 honeypots, Web3Forms submit, helpers (key = __WEB3FORMS_KEY__ placeholder)")
