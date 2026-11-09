#!/usr/bin/env python3
"""Forms polish (on top of patch_forms.py, which is already live): the Web3Forms email gets human-readable field names,
a "12 Dec 2026" date, Call + WhatsApp links built from the customer's phone, "Submitted from", and subject fallbacks.
Edits src/site.html only, by one exact-match anchor (the w3fBody function). Does NOT touch the access key line.
Stops unless the anchor is found exactly once. Idempotent (2nd run says "already done"). Writes src/site.html.bak-forms2 first."""
import sys, shutil, pathlib, re
P = pathlib.Path("src/site.html")
s = P.read_text(encoding="utf-8")
if "Submitted from" in s:
    print("already done"); sys.exit(0)

OLD = r"""function w3fBody(f,kind){const v=vals(f),hp=f.querySelector('input[name=botcheck]'),b={access_key:W3F_KEY,from_name:'RR Durbar website',botcheck:!!(hp&&hp.checked)};
 b.name=v.name;b.phone=v.phone;if(v.email)b.email=v.email;
 if(kind==='catering'){b.event_type=v['event type'];b.date=v['event date'];b.guests=v['guest count'];b.location=v.location;b.message=v.requirements||'';
  b.subject='[RR Durbar] Catering enquiry \u2013 '+v['event type']+' \u2013 '+v['event date']}
 else{b.topic=v.subject;b.message=v.message;b.subject='[RR Durbar] Contact \u2013 '+v.name}
 return b}"""

NEW = r"""function w3fBody(f,kind){const v=vals(f),hp=f.querySelector('input[name=botcheck]'),b={access_key:W3F_KEY,from_name:'RR Durbar website',botcheck:!!(hp&&hp.checked)};
 const set=(k,x)=>{if(x)b[k]=x},M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  nice=x=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(x||'');return m?(+m[3])+' '+M[+m[2]-1]+' '+m[1]:(x||'')},
  d=(v.phone||'').replace(/\D/g,'').slice(-10);
 set('Name',v.name);set('Phone',v.phone);set('Email',v.email);if(v.email)b.replyto=v.email;
 if(kind==='catering'){const dt=nice(v['event date']);
  set('Event type',v['event type']);set('Event date',dt);set('Number of guests',v['guest count']);set('Venue / location',v.location);set('Requirements',v.requirements);
  b.subject='[RR Durbar] Catering enquiry \u2013 '+(v['event type']||'Enquiry')+' \u2013 '+(dt||'date not given')}
 else{set('Topic',v.subject);set('Message',v.message);b.subject='[RR Durbar] Contact \u2013 '+v.name}
 if(d.length===10){b.Call='tel:+91'+d;b.WhatsApp='https://wa.me/91'+d}
 b['Submitted from']=location.href;return b}"""

if s.count(OLD) != 1:
    print(f"STOP: w3fBody anchor found {s.count(OLD)}x, expected 1"); sys.exit(1)
key_line = re.search(r"W3F_KEY='[^']*'", s).group(0)
shutil.copy(P, str(P) + ".bak-forms2")
s2 = s.replace(OLD, NEW)
assert re.search(r"W3F_KEY='[^']*'", s2).group(0) == key_line, "access key line changed"
P.write_text(s2, encoding="utf-8")
print("patched: readable field names, nice date, Call + WhatsApp, Submitted from, subject fallbacks (key untouched)")
