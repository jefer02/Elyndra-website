// Build-time renderers of the privacy page and the 404 page.
import { esc, pagePath, type PageCtx } from './layout.ts';
import { icon } from './icons.ts';

export function renderPrivacy(ctx: PageCtx): string {
  const p = ctx.locale.dict.privacy;
  const list = (items: string[]) => `<ul class="prose-list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  return `<article class="page page-privacy">
  <div class="wrap prose">
    <p class="eyebrow">${icon('shield')}${esc(ctx.locale.dict.privacyTeaser.eyebrow)}</p>
    <h1>${esc(p.title)}</h1>
    <p class="fine">${esc(p.updated)}</p>
    <p class="lead">${esc(p.intro)}</p>

    <h2>${esc(p.appTitle)}</h2>
    <h3>${esc(p.localTitle)}</h3>
    <p>${esc(p.local)}</p>

    <h3>${esc(p.servicesTitle)}</h3>
    <p>${esc(p.servicesLead)}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="${esc(p.servicesTitle)}">
      <table class="svc-table">
        <thead><tr><th scope="col">${esc(p.thService)}</th><th scope="col">${esc(p.thWhen)}</th><th scope="col">${esc(p.thWhat)}</th></tr></thead>
        <tbody>${p.services.map((s) => `<tr><th scope="row">${esc(s.s)}</th><td>${esc(s.w)}</td><td>${esc(s.d)}</td></tr>`).join('')}</tbody>
      </table>
    </div>

    <h3>${esc(p.permsTitle)}</h3>
    ${list(p.perms)}

    <h3>${esc(p.controlTitle)}</h3>
    ${list(p.control.map(esc))}

    <h2>${esc(p.siteTitle)}</h2>
    ${list(p.site)}

    <h2>${esc(p.contactTitle)}</h2>
    <p>${p.contact}</p>

    <p><a class="btn btn-ghost" href="${pagePath(ctx.locale, 'home')}">${icon('chevronL')}<span>${esc(p.back)}</span></a></p>
  </div>
</article>`;
}

export function renderNotFound(ctx: PageCtx): string {
  const n = ctx.locale.dict.notFound;
  return `<section class="page page-404">
  <div class="wrap not-found">
    <p class="nf-code" aria-hidden="true">404</p>
    <h1>${esc(n.title)}</h1>
    <p class="lead">${esc(n.body)}</p>
    <a class="btn btn-primary" href="${pagePath(ctx.locale, 'home')}">${icon('chevronL')}<span>${esc(n.home)}</span></a>
  </div>
</section>`;
}
