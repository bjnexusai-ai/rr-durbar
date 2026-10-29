
(async () => {
  const menuFilters = document.querySelector('.rr-category-chips');
  const menuContainer = document.getElementById('rr-menu-items');
  const homeCategoryGrid = document.querySelector('#menu .category-grid');
  const outletList = document.getElementById('rr-location-list');
  const homeOutletGrid = document.querySelector('#outlets .rr-grid');
  const orderOutlet = document.getElementById('rr-order-outlet');

  const makeElement = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  };
  const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);

  try {
    let data;
    const inline = document.getElementById('rr-data-inline');
    try {
      if (!inline) throw new Error('no inline data');
      data = JSON.parse(inline.textContent);
    } catch (inlineError) {
      const response = await fetch('rr-durbar-mockup-data.json');
      if (!response.ok) throw new Error('Client menu data unavailable');
      data = await response.json();
    }
    const items = Array.isArray(data.menu_items) ? data.menu_items : [];
    const categories = Array.isArray(data.menu_categories) ? data.menu_categories : [];
    const outlets = Array.isArray(data.outlets) ? data.outlets : [];
    const itemByName = new Map(items.map((item) => [item.name.trim().toLowerCase(), item]));

    const makeOutletCard = (outlet, index) => {
      const card = makeElement('article', 'rr-card rr-location-card');
      card.append(makeElement('span', 'rr-location-number', outlet.branch_label || String(index + 1).padStart(2, '0')));
      const details = makeElement('div');
      details.append(makeElement('h3', '', outlet.name));
      const full = [outlet.address, outlet.city || 'Vijayawada', outlet.zip || outlet.pincode].filter(Boolean).join(', ');
      details.append(makeElement('p', 'rr-location-address', full));
      const hm = String(outlet.hours || '').match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      const f12 = (h, m2) => { h = +h; return ((h + 11) % 12 + 1) + ':' + m2 + ' ' + (h < 12 ? 'AM' : 'PM'); };
      details.append(makeElement('p', 'rr-location-hours', hm ? 'Open daily ' + f12(hm[1], hm[2]) + ' \u2013 ' + f12(hm[3], hm[4]) : 'Call for hours'));
      const digits = String(outlet.phone || '').replace(/\D/g, '').slice(-10);
      if (digits) { const ph = makeElement('a', 'rr-phone-link', digits.slice(0, 5) + ' ' + digits.slice(5)); ph.href = 'tel:+91' + digits; const pw = makeElement('p', 'rr-location-phone'); pw.append(ph); details.append(pw); }
      card.append(details);
      const actions = makeElement('div', 'rr-outlet-actions');
      const dir = makeElement('a', '', 'Get directions');
      dir.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('RR Durbar ' + outlet.name + ', ' + full);
      dir.target = '_blank'; dir.rel = 'noopener noreferrer'; actions.append(dir);
      if (digits) { const call = makeElement('a', '', 'Call'); call.href = 'tel:+91' + digits; actions.append(call); }
      const orderLink = makeElement('a', '', 'Order pickup');
      orderLink.href = (function(){var k=String(outlet.name||'').toLowerCase().replace(/[^a-z]/g,'');return {singhnagar:1,moghalrajpuram:1,bhavanipuram:1,poranki:1,autonagar:1}[k]?'?page=pickup-menu&outlet='+k:'?page=order-now#ordering'})();
      orderLink.dataset.outletChoice = outlet.branch_label || '';
      actions.append(orderLink);
      card.append(actions);
      return card;
    };

    if (menuFilters && menuContainer) {
      menuFilters.setAttribute('aria-label', 'Filter pickup menu by category');
      menuFilters.replaceChildren();
      const filterButtons = new Map();
      const addFilter = (label, value) => {
        const button = makeElement('button', 'rr-chip', label);
        button.type = 'button';
        button.dataset.menuFilter = value;
        button.setAttribute('aria-pressed', String(value === 'all'));
        menuFilters.append(button);
        filterButtons.set(value, button);
      };
      addFilter('All menu', 'all');
      categories.forEach((category) => addFilter(category, category));
      const vegToggle = makeElement('button', 'rr-chip', 'Veg only');
      vegToggle.type = 'button';
      vegToggle.id = 'rr-veg-toggle';
      vegToggle.setAttribute('aria-pressed', 'false');
      menuFilters.append(vegToggle);

      menuContainer.replaceChildren();
      categories.forEach((category) => {
        const group = makeElement('section', 'rr-menu-group');
        group.dataset.menuGroup = category;
        group.append(makeElement('h3', '', category));
        items.filter((item) => item.category === category).forEach((item) => {
          const row = makeElement('article', 'rr-menu-row');
          row.dataset.diet = item.dietary || '';
          const copy = makeElement('div');
          copy.append(makeElement('h4', '', item.name));
          if (item.description) copy.append(makeElement('p', '', item.description));
          copy.append(makeElement('p', 'rr-dietary-label', item.dietary === 'non-veg' ? 'Non-vegetarian' : item.dietary === 'egg' ? 'Contains egg' : 'Vegetarian'));
          row.append(copy);
          const orderGroup = makeElement('div', 'rr-menu-order-group');
          const swiggyBtn = makeElement('a', 'rr-order-chip rr-order-swiggy', 'Swiggy');
          if((window.RR_LISTINGS||{}).swiggy){swiggyBtn.href=window.RR_LISTINGS.swiggy;swiggyBtn.target='_blank';swiggyBtn.rel='noopener noreferrer'}else{swiggyBtn.setAttribute('aria-disabled','true');swiggyBtn.title='Swiggy link coming soon'}
          swiggyBtn.setAttribute('aria-label', `Order ${item.name} on Swiggy — price shown on Swiggy`);
          const zomatoBtn = makeElement('a', 'rr-order-chip rr-order-zomato', 'Zomato');
          if((window.RR_LISTINGS||{}).zomato){zomatoBtn.href=window.RR_LISTINGS.zomato;zomatoBtn.target='_blank';zomatoBtn.rel='noopener noreferrer'}else{zomatoBtn.setAttribute('aria-disabled','true');zomatoBtn.title='Zomato link coming soon'}
          zomatoBtn.setAttribute('aria-label', `Order ${item.name} on Zomato — price shown on Zomato`);
          const pickupBtn = makeElement('button', 'rr-order-chip rr-order-pickup', 'Pickup');
          pickupBtn.type = 'button';
          pickupBtn.setAttribute('aria-label', `Pick up ${item.name} — routes to the outlet-verified Rista pickup order flow`);
          pickupBtn.addEventListener('click', () => { window.rrGo ? window.rrGo('?page=order-now#ordering') : (window.location.href = '?page=order-now#ordering'); });
          orderGroup.append(swiggyBtn, zomatoBtn, pickupBtn);
          row.append(orderGroup);
          group.append(row);
        });
        menuContainer.append(group);
      });

      const requestedCategory = new URLSearchParams(window.location.search).get('category');
      let selectedCategory = requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'all';
      let vegOnly = false;
      const updateMenu = () => {
        menuContainer.querySelectorAll('[data-menu-group]').forEach((group) => {
          const categoryMatches = selectedCategory === 'all' || group.dataset.menuGroup === selectedCategory;
          const rows = [...group.querySelectorAll('.rr-menu-row')];
          rows.forEach((row) => { row.hidden = vegOnly && row.dataset.diet !== 'veg'; });
          group.hidden = !categoryMatches || !rows.some((row) => !row.hidden);
        });
      };
      const chooseCategory = (category, scroll = false) => {
        selectedCategory = category;
        filterButtons.forEach((button, value) => button.setAttribute('aria-pressed', String(value === category)));
        updateMenu();
        if (scroll) document.getElementById('menu-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      chooseCategory(selectedCategory);
      window.__rrChooseCategory = chooseCategory;
      menuFilters.addEventListener('click', (event) => {
        const button = event.target.closest('[data-menu-filter]');
        if (button) chooseCategory(button.dataset.menuFilter);
      });
      vegToggle.addEventListener('click', () => {
        vegOnly = !vegOnly;
        vegToggle.setAttribute('aria-pressed', String(vegOnly));
        vegToggle.textContent = vegOnly ? 'Veg only · on' : 'Veg only';
        updateMenu();
      });
      homeCategoryGrid?.replaceChildren();
      const featuredCategories = ['Special Biryani', 'Non-Veg Biryani', 'Non-Veg Starters', 'Veg Starters', 'Sea Food', 'Non-Veg Curries'];
      featuredCategories.filter((category) => categories.includes(category)).forEach((category, index) => {
        const link = makeElement('a', 'category');
        const linkParams = new URLSearchParams({ page: 'menu', category });
        link.href = `${window.location.pathname}?${linkParams.toString()}#menu-page`;
        link.dataset.homeFilter = category;
        const photo = makeElement('span', 'cat-photo');
        const csrc = (window.RR_CAT_IMG || {})[category];
        if (csrc) {
          const cimg = document.createElement('img');
          cimg.src = csrc; cimg.alt = category; cimg.loading = 'lazy'; cimg.decoding = 'async';
          photo.append(cimg);
        } else {
          photo.classList.add('cat-photo-empty');
          photo.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#E7B85C" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="m2 7 4 3 6-6 6 6 4-3-2 12H4z"/></svg>';
        }
        link.append(photo);
        link.append(makeElement('strong', '', category));
        const count = items.filter((item) => item.category === category).length;
        link.append(makeElement('small', '', `${count} dishes`));
        homeCategoryGrid?.append(link);
      });
      homeCategoryGrid?.addEventListener('click', (event) => {
        const link = event.target.closest('[data-home-filter]');
        if (!link) return;
        event.preventDefault();
        const params = new URLSearchParams({ page: 'menu', category: link.dataset.homeFilter });
        const dest = `?${params.toString()}#menu-page`;
        if (window.rrGo) window.rrGo(dest); else window.location.href = `${window.location.pathname}${dest}`;
      });
    }

    if (outletList) outletList.replaceChildren(...outlets.map(makeOutletCard));
    if (homeOutletGrid) {
      homeOutletGrid.replaceChildren(...outlets.map(makeOutletCard));
      homeOutletGrid.setAttribute('aria-label', 'Three of six RR Durbar outlets');
    }
    document.querySelector('#locations .rr-location-switch')?.remove();
    document.querySelectorAll('[data-outlet-choice]').forEach((link) => {
      link.addEventListener('click', () => {
        if (orderOutlet) orderOutlet.value = link.dataset.outletChoice;
      });
    });
    if (orderOutlet) {
      const options = [makeElement('option', '', 'Choose an outlet for pickup')];
      options[0].value = '';
      outlets.forEach((outlet) => {
        const option = makeElement('option', '', `${outlet.name} (${outlet.branch_label})`);
        option.value = outlet.branch_label;
        options.push(option);
      });
      orderOutlet.replaceChildren(...options);
    }
    const pickupTime = document.getElementById('rr-pickup-time');
    if (pickupTime) pickupTime.replaceChildren(makeElement('option', '', 'Choose an outlet to see pickup times'));

    const story = data.about_page?.story?.replace(/\s*\[CONFIRM:[^\]]*\]/g, '').trim();
    const about = document.getElementById('about');
    if (about && story) {
      const intro = about.querySelector('.rr-container > .rr-copy');
      if (false && intro) {
        intro.replaceChildren(...story.split(/\n\n+/).filter(Boolean).slice(0, 2).map((paragraphText) => makeElement('span', '', paragraphText)));
        [...intro.children].forEach((paragraph, index) => { if (index < intro.children.length - 1) paragraph.style.display = 'block'; });
      }
      const visionHeading = [...about.querySelectorAll('h2')].find((heading) => heading.textContent.trim() === 'Vision & mission');
      if (visionHeading) {
        visionHeading.nextElementSibling?.remove();
        visionHeading.remove();
      }
      const timeline = about.querySelector('.rr-timeline');
      if (timeline) {
        timeline.replaceChildren(...(data.about_page.milestones || []).map((milestone, index) => {
          const article = makeElement('article');
          article.append(makeElement('b', '', `Milestone ${String(index + 1).padStart(2, '0')}`));
          article.append(makeElement('h3', '', milestone.label));
          article.append(makeElement('p', 'rr-copy', milestone.detail));
          return article;
        }));
        timeline.style.gridTemplateColumns = 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))';
      }
      const awardsHeading = [...about.querySelectorAll('h2')].find((heading) => heading.textContent.trim() === 'Awards & recognition');
      if (awardsHeading) {
        const note = awardsHeading.nextElementSibling;
        if (note) note.textContent = 'Recognitions supplied by RR Durbar. Years are shown only where confirmed.';
        const awardGrid = note?.nextElementSibling;
        const awards = (data.about_page.awards || []).filter((award) => !award.note);
        if (awardGrid) {
          awardGrid.replaceChildren(...awards.map((award) => {
            const card = makeElement('article', 'rr-card');
            card.append(makeElement('span', 'rr-edit-label', `${award.issuer}${award.year ? ` · ${award.year}` : ''}`));
            card.append(makeElement('h3', '', award.title));
            card.append(makeElement('p', '', award.brand));
            return card;
          }));
        }
      }
    }

    const storySection = document.getElementById('story');
    const storyCopy = storySection?.querySelector('[data-story-copy]');
    if (storyCopy && story) {
      storyCopy.classList.add('rr-story-copy');
      storyCopy.replaceChildren(...story.split(/\n\n+/).filter(Boolean).map((paragraphText) => makeElement('span', '', paragraphText)));
    }
    const storyMilestones = storySection?.querySelector('[data-story-milestones]');
    if (storyMilestones) {
      storyMilestones.replaceChildren(...(data.about_page?.milestones || []).map((milestone, index) => {
        const article = makeElement('article');
        article.append(makeElement('b', '', `Milestone ${String(index + 1).padStart(2, '0')}`));
        article.append(makeElement('h3', '', milestone.label));
        article.append(makeElement('p', 'rr-copy', milestone.detail));
        return article;
      }));
    }

    const signatureGrid = document.querySelector('#bestsellers .rr-grid-3');
    if (signatureGrid) {
      const SIG = window.RR_SIG_IMG || {};
      const crown = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#E7B85C" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="m2 7 4 3 6-6 6 6 4-3-2 12H4z"/></svg>';
      const sigNames = (data.about_page?.signature_dishes || []).filter((n) => !/royyala/i.test(n)).map((n) => ({ name: n }));
      if (!sigNames.some((x) => /chicken 555/i.test(x.name))) sigNames.push({ name: 'Chicken 555' });
      const extras = [
        { name: 'Butta Biryani', lookup: 'non veg butta biryani', desc: 'Fragrant dum biryani layered with tender chicken, slow-cooked in the Durbar way.' },
        { name: 'Vankay Biryani', desc: 'Andhra-style brinjal biryani, rich with spices and slow-cooked to a royal finish.' },
        { name: 'Chicken & Paneer Tikka', desc: 'Chargrilled chicken and paneer tikka, marinated in Durbar masalas and finished in the tandoor.' },
      ];
      const all = [...sigNames, ...extras.filter((e) => !sigNames.some((x) => x.name.toLowerCase() === e.name.toLowerCase()))];
      all.sort((x, y) => (SIG[y.name.toLowerCase()] ? 1 : 0) - (SIG[x.name.toLowerCase()] ? 1 : 0));
      signatureGrid.replaceChildren(...all.map((entry) => {
        const name = entry.name;
        const lk = (entry.lookup || name).trim().toLowerCase();
        const item = itemByName.get(lk) || (/naatu/.test(lk) ? itemByName.get('naatu naatu special wings (8 pcs)') : /supreme/.test(lk) ? itemByName.get("durbar's supreme chicken") : null);
        const card = makeElement('article', 'rr-card rr-signature-card rr-food-card');
        const media = makeElement('span', 'rr-media');
        const src = SIG[name.toLowerCase()];
        if (src) {
          const img = document.createElement('img');
          img.src = src; img.alt = RRDN(name); img.loading = 'lazy'; img.decoding = 'async';
          media.append(img);
        } else {
          media.classList.add('rr-media-empty');
          media.innerHTML = crown;
        }
        card.append(media);
        const copy = makeElement('div', 'rr-food-copy');
        copy.append(makeElement('span', 'rr-edit-label', item ? item.category : 'Signature dish'));
        const title = makeElement('h3', '', RRDN(name));
        copy.append(title);
        const dtext = (item?.description && item.description.trim()) || entry.desc;
        if (dtext) copy.append(makeElement('p', '', dtext));
        card.append(copy);
        return card;
      }));
    }

    const stats = [...document.querySelectorAll('#stats .rr-stat')];
    const statValues = [
      [outlets.length, 'Vijayawada outlets'],
      [categories.length, 'Menu categories'],
      [items.length, 'Pickup menu items'],
      [(data.business?.sub_brands || []).length, 'Associated brands'],
    ];
    stats.forEach((stat, index) => {
      const [value, label] = statValues[index] || [];
      if (value !== undefined) {
        const strong = stat.querySelector('strong');
        const caption = stat.querySelector('span');
        if (strong) strong.textContent = String(value);
        if (caption) caption.textContent = label;
      }
    });

    const reviewGrid = document.querySelector('#reviews .rr-grid-3');
    if (reviewGrid) {
      reviewGrid.remove();
    }
    const contactCard = [...document.querySelectorAll('#contact .rr-card')].find((card) => card.querySelector('h3')?.textContent.trim() === 'Reach the team');
    if (contactCard && outlets[0]?.phone) {
      const paragraph = contactCard.querySelector('p');
      if (paragraph) {
        paragraph.replaceChildren(makeElement('span', '', 'Phone: '));
        const phone = makeElement('a', '', outlets[0].phone);
        phone.href = `tel:${String(outlets[0].phone).replace(/[^\d+]/g, '')}`;
        paragraph.append(phone);
      }
    }
  } catch {
    if (menuContainer) menuContainer.replaceChildren(makeElement('p', 'rr-copy', 'Menu data could not be loaded.'));
    if (outletList) outletList.replaceChildren(makeElement('p', 'rr-copy', 'Outlet data could not be loaded.'));
  }
})();

;

(() => {
  const pageSections = {
    home: ['home', 'bestsellers', 'menu', 'trust', 'honours', 'reviews', 'gallery', 'loyalty', 'outlets', 'cta'],
    loyalty: ['loyalty'],
    'about-us': ['about', 'story', 'foundation', 'family', 'why-us', 'about-sig', 'about-go', 'purpose', 'promise-green', 'stats', 'awards', 'reels'],
    'our-story': ['about', 'story', 'foundation', 'family', 'why-us', 'about-sig', 'about-go', 'purpose', 'promise-green', 'stats', 'awards', 'reels'],
    menu: ['menu-page'],
    'order-now': ['ordering'],
    locations: ['locations'],
    'track-order': ['track-order', 'tracking'],
    catering: ['catering', 'catering-occasions', 'catering-serve', 'catering-why', 'catering-gallery', 'catering-cta'],
    branches: ['br-locator', 'br-list'],
    pickup: ['pickup'],
    'pickup-menu': ['pickup-menu'],
    contact: ['contact'],
    policies: ['policies'],
    'privacy-policy': ['pol-privacy'],
    'terms-of-service': ['pol-terms'],
    'refund-cancellation': ['pol-refund'],
  };
  const sectionPages = {
    home: 'home', trust: 'home', foundation: 'about-us', social: 'about-us', founder: 'about-us', purpose: 'about-us', menu: 'home', bestsellers: 'home', 'outlets-green': 'home',
    'promise-green': 'about-us', family: 'about-us', 'about-sig': 'about-us', 'about-go': 'about-us', 'why-us': 'about-us', stats: 'about-us', about: 'about-us', story: 'about-us',
    'menu-page': 'menu',
    ordering: 'order-now', outlets: 'home', loyalty: 'home', awards: 'home', cta: 'home', locations: 'locations', 'track-order': 'track-order', tracking: 'track-order',
    pickup: 'pickup', 'pickup-menu': 'pickup-menu', 'br-locator': 'branches', 'br-list': 'branches', catering: 'catering', 'catering-form': 'catering', 'catering-occasions': 'catering', 'catering-serve': 'catering', 'catering-why': 'catering', 'catering-gallery': 'catering', 'catering-cta': 'catering', contact: 'contact', 'contact-form': 'contact', policies: 'policies',
    'privacy-policy': 'policies', terms: 'policies', refunds: 'policies', gallery: 'home', reviews: 'home', speciality: 'home', reels: 'about-us',
  };
  const pageTitles = {
    home: 'Home', 'about-us': 'About Us', 'our-story': 'Our Story', menu: 'Menu',
    'order-now': 'Order Now', pickup: 'Pickup', 'pickup-menu': 'Pickup Menu', locations: 'Locations & Outlets', 'track-order': 'Track Your Order',
    branches: 'Branches', catering: 'Catering Enquiry', contact: 'Contact', policies: 'Policies', loyalty: 'Loyalty / Rewards',
    'privacy-policy': 'Privacy Policy', 'terms-of-service': 'Terms of Service', 'refund-cancellation': 'Refund & Cancellation',
  };
  const sections = [...document.querySelectorAll('section[id]')];
  Object.assign(sectionPages,{'pol-privacy':'privacy-policy','pol-terms':'terms-of-service','pol-refund':'refund-cancellation','privacy-policy':'privacy-policy','terms':'terms-of-service','refunds':'refund-cancellation'});
  [['pp',12,'privacy-policy'],['tt',14,'terms-of-service'],['rf',9,'refund-cancellation']].forEach(function(a){for(var i=1;i<=a[1];i++)sectionPages[a[0]+'-'+i]=a[2]});
  const routeForSection = (sectionId) => sectionPages[sectionId] || 'home';
  const grab = (href, re) => { const m = String(href || '').match(re); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };
  let page = 'home';

  const scrollToHash = (hash) => {
    const id = String(hash || '').replace(/^#/, '');
    if (!id) return;
    window.setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(id));
      if (target && !target.closest('.rr-page-hidden')) target.scrollIntoView({ block: 'start' });
    }, 80);
  };

  const pageSeo = {"pickup-menu": {"title": "Pickup Menu | RR Durbar Vijayawada", "desc": "Choose your dishes and order pickup from your RR Durbar outlet in Vijayawada.", "path": "/pickup/"}, "pickup": {"title": "Pickup | Choose your RR Durbar outlet in Vijayawada", "desc": "Pick the RR Durbar outlet nearest you in Vijayawada and order pickup.", "path": "/pickup/"}, "home": {"title": "RR Durbar | Biryani & Andhra Food in Vijayawada", "desc": "Since 1991, RR Durbar serves royal biryani and Andhra favourites across six Vijayawada outlets. Order for pickup or on Swiggy and Zomato.", "path": "/"}, "about-us": {"title": "About RR Durbar | Vijayawada’s Royal Dining Legacy", "desc": "The story of RR Durbar: a Vijayawada family restaurant since 1991, awarded Best Restaurant in Andhra Pradesh and loved for biryani and Andhra food.", "path": "/about-us/"}, "our-story": {"title": "Our Story | RR Durbar Vijayawada", "desc": "How RR Durbar grew from a family poultry business into one of Vijayawada’s best-loved dining destinations.", "path": "/our-story/"}, "menu": {"title": "Menu | RR Durbar Vijayawada", "desc": "Browse the RR Durbar menu: signature biryanis, starters and Andhra specials. Order for pickup or on Swiggy and Zomato.", "path": "/menu/"}, "order-now": {"title": "Order Online | RR Durbar Vijayawada", "desc": "Order from RR Durbar for pickup at any of six Vijayawada outlets, or get it delivered through Swiggy and Zomato.", "path": "/order-now/"}, "locations": {"title": "Locations & Outlets | RR Durbar Vijayawada", "desc": "Find the nearest RR Durbar in Vijayawada. Six outlets with addresses, opening hours and directions.", "path": "/locations/"}, "branches": {"title": "Our 6 Outlets in Vijayawada | RR Durbar", "desc": "Singhnagar, Moghalrajpuram, Bhavanipuram, Poranki, Patamatalanka and Autonagar. Find addresses, hours and directions for every RR Durbar outlet.", "path": "/branches/"}, "track-order": {"title": "Track Your Order | RR Durbar", "desc": "Follow your RR Durbar pickup order from confirmation to collection.", "path": "/track-order/"}, "catering": {"title": "Catering in Vijayawada | RR Durbar", "desc": "RR Durbar catering for gatherings and events in Vijayawada. Royal buffet setups and live counters. Request a proposal.", "path": "/catering/"}, "contact": {"title": "Contact RR Durbar | Vijayawada", "desc": "Call RR Durbar on +91 77020 77999, send an enquiry or ask about catering. Six outlets across Vijayawada.", "path": "/contact/"}, "policies": {"title": "Policies | RR Durbar", "desc": "Privacy, terms and refund policies for rrdurbar.com and RR Durbar pickup orders.", "path": "/policies/"}, "privacy-policy": {"title": "Privacy Policy | RR Durbar", "desc": "How RR Durbar collects, uses and protects your personal data on rrdurbar.com.", "path": "/privacy-policy/"}, "terms-of-service": {"title": "Terms of Service | RR Durbar", "desc": "The terms for using rrdurbar.com, ordering for pickup and enquiring about catering with RR Durbar.", "path": "/terms-of-service/"}, "refund-cancellation": {"title": "Refund & Cancellation | RR Durbar", "desc": "How cancellations, missing or wrong items and refunds are handled for RR Durbar pickup orders and catering.", "path": "/refund-cancellation/"}, "loyalty": {"title": "Loyalty / Rewards | RR Durbar Vijayawada", "desc": "Join the RR Durbar Royal Club. Earn points on every order at our Vijayawada outlets and redeem them on your next visit.", "path": "/loyalty/"}};
  const rrSetMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  const rrSeo = (p) => { const d = pageSeo[p] || pageSeo.home; document.title = d.title; rrSetMeta('meta[name="description"]', d.desc); rrSetMeta('meta[property="og:title"]', d.title); rrSetMeta('meta[property="og:description"]', d.desc);
    const url = 'https://rrdurbar.com' + d.path; const c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute('href', url);
    let u = document.querySelector('meta[property="og:url"]'); if (!u) { u = document.createElement('meta'); u.setAttribute('property', 'og:url'); document.head.appendChild(u); } u.setAttribute('content', url); };
  const applyPage = (requested) => {
    page = pageSections[requested] ? requested : 'home';
    document.body.classList.add('rr-route-active');
    document.body.classList.toggle('rr-home-route', page === 'home');
    document.title = `${pageTitles[page]} | RR Durbar`;
    rrSeo(page);
    sections.forEach((section) => {
      const sectionOrder = pageSections[page].indexOf(section.id);
      section.classList.toggle('rr-page-visible', sectionOrder !== -1);
      section.classList.toggle('rr-page-hidden', sectionOrder === -1);
      if (sectionOrder !== -1) {
        section.classList.add('rr-visible');
        section.style.order = String(sectionOrder);
      } else section.style.removeProperty('order');
    });
    if (page === 'home' || page === 'about-us') {
      const vis = sections.filter((x) => x.classList.contains('rr-page-visible') && x.id !== 'home').sort((a, b) => Number(a.style.order) - Number(b.style.order));
      /* RR lighting pass: every content band is cream. Only the hero, the green banner, the closing CTA and the footer are dark.
         Two cream tones alternate so bands stay distinct without turning maroon. */
      let tone = 0;
      vis.forEach((x) => {
        x.classList.remove('rr-tone-a', 'rr-tone-b');
        if (x.id === 'cta' || x.classList.contains('rrm-green')) return;
        x.classList.remove('rr-dark');
        x.classList.add(tone++ % 2 ? 'rr-tone-b' : 'rr-tone-a');
      });
    }
    document.querySelectorAll('.nav-links a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isActive = href.includes(`page=${page}`) || href.startsWith(`/${page}/`) || (page === 'home' && link.classList.contains('nav-home'));
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const isRouteHref = (href) => !!href && !/^[a-z][a-z0-9+.-]*:/i.test(href) && (/[?&]page=/.test(href) || href.charAt(0) === '#');

  // In-page navigation: no reload, so it also works in previews / file:// / sandboxed iframes.
  const go = (href) => {
    const hash = href.indexOf('#') > -1 ? href.slice(href.indexOf('#')) : '';
    const requested0 = grab(href, /[?&]page=([^&#]*)/) || routeForSection(grab(hash, /^#(.*)$/));
    const requested = requested0 === 'our-story' ? 'about-us' : requested0; /* v73: Our Story lives only on About Us */
    const category = grab(href, /[?&]category=([^&#]*)/);
    const rrQs = ((href.split('#')[0].split('?')[1]) || '').split('&').filter((p) => p && !/^page=/.test(p)).join('&');
    const rrHere = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (requested !== window.RR_PAGE && !(href.charAt(0) === '#' && rrHere && !rrHere.closest('.rr-page-hidden'))) { window.location.href = (requested === 'home' ? '/' : '/' + requested + '/') + (rrQs ? '?' + rrQs : '') + hash; return; }
    try { window.history.pushState({ rr: 1 }, '', window.location.pathname + (rrQs ? '?' + rrQs : '') + hash); } catch (e) { /* sandboxed */ }
    applyPage(requested);
    if (category && window.__rrChooseCategory) window.__rrChooseCategory(category);
    if (hash) scrollToHash(hash); else window.scrollTo(0, 0);
  };
  window.rrGo = go;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || (link.target && link.target !== '_self')) return;
    const href = link.getAttribute('href');
    if (!isRouteHref(href)) return;
    event.preventDefault();
    go(href);
  });

  window.addEventListener('popstate', () => {
    const loc = window.location;
    applyPage(window.RR_PAGE);
    const category = grab(loc.search, /[?&]category=([^&#]*)/);
    if (category && window.__rrChooseCategory) window.__rrChooseCategory(category);
    if (loc.hash) scrollToHash(loc.hash); else window.scrollTo(0, 0);
  });

  const updateLinks = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const sectionId = link.getAttribute('href')?.slice(1);
      if (!sectionId) return;
      const destinationPage = routeForSection(sectionId);
      link.href = destinationPage === page
        ? `#${encodeURIComponent(sectionId)}`
        : `${destinationPage === 'home' ? '/' : '/' + destinationPage + '/'}#${encodeURIComponent(sectionId)}`;
      link.target = '_self';
    });
  };

  applyPage(window.RR_PAGE);
  scrollToHash(window.location.hash);
  updateLinks();
  new MutationObserver(updateLinks).observe(document.body, { childList: true, subtree: true });
})();
