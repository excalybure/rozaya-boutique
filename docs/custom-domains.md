# Custom domain setup

This storefront runs on Vercel. Shopify provides the catalog, cart and checkout;
it does not host this Next.js application's pages. The domains are registered
with Squarespace, which also hosts their DNS.

The intended routing is:

```text
Custom domain -> Vercel storefront -> Shopify commerce APIs / checkout
```

## Canonical website and redirects

The owner selected **`https://rozaya-boutique.com`** as the primary website.
`lib/seo.ts` is the shared source for the origin, canonical URL helpers and the
host-limited redirect rules used by `next.config.ts`.

- `www.rozaya-boutique.com`, `rozayaboutique.com` and
  `www.rozayaboutique.com` permanently redirect to the primary website.
- Redirects use HTTP **308**, preserving the request method, page path and query
  parameters. They do not send every incoming link to the homepage.
- The primary host does not redirect to itself. No redirect rule targets local
  development, preview deployments, `rozaya-boutique.vercel.app` or Shopify's
  checkout host. Existing Shopify checkout settings are unchanged.
- Each page supplies its own canonical rather than inheriting a homepage
  canonical. Tracking, sorting, collection-filter and product-variant parameters
  are omitted from canonical URLs. Meaningful search text (`q`) is retained.
- Robots sitemap references, sitemap URLs and the metadata base use the same
  primary origin, independently of `VERCEL_PROJECT_PRODUCTION_URL`. Existing
  hidden-product/draft-policy noindex rules are preserved.
- Metadata is emitted in the initial document head using Next.js's supported
  `htmlLimitedBots: /.*/` setting. This avoids body/head canonical duplication
  observed with this Next.js version's streaming metadata. Metadata-dependent
  data must resolve before the initial response; content streaming is unchanged.

The existing partial-prerendered not-found response may have HTTP 200 after its
shell has streamed; it still renders the not-found page with `noindex` and no
canonical. This behavior was confirmed on the pre-change production site and
is not altered by the canonical-domain changes.

These application changes do not edit DNS or email records. Do not reapply the
historical Squarespace removal instructions below just to enable SEO redirects.
Redirects do not copy browser cookies between hosts: visitors previously using
an alias may need to set privacy choices or recreate a cart on the primary host.
The implementation deliberately does not rewrite consent/cart cookies.

## Google discovery after deployment

1. Verify `rozaya-boutique.com` as a Domain property in Google Search Console
   using the DNS record supplied by Google. Adding that verification TXT record
   is a separate owner action; preserve all existing mail and DNS records.
2. Inspect `https://rozaya-boutique.com/` with **Test live URL** and review crawl
   access, indexing eligibility, rendered content and canonical selection. Also
   inspect the older `www` URL if Google still lists it without page information.
3. Submit `https://rozaya-boutique.com/sitemap.xml` and request indexing of the
   primary homepage and important real collection/product pages.
4. Monitor Google's subsequent crawl/indexing reports. The current robots file
   permits crawling; a stale Google result does not establish a present block.

No code change can guarantee indexing, an immediate refreshed snippet, or a
particular ranking. Google Search Console access and actual Google-side reports
are needed to establish why an earlier result had no page information.

## Historical initial configuration

The owner's Vercel screenshot showed all four custom hostnames assigned to
Production but marked **Invalid Configuration**:

- `rozaya-boutique.com`
- `www.rozaya-boutique.com`
- `rozayaboutique.com`
- `www.rozayaboutique.com`

The deployment at <https://rozaya-boutique.vercel.app> was working. Public DNS
lookups still pointed the custom domains to Squarespace, which served the
"under construction" page. A domain appearing in Vercel's deployment summary
does not mean its DNS is connected.

These are the exact replacement values visible in that screenshot:

| Domain                | Type  | Host / Name in Squarespace | Value / Data                                                      |
| --------------------- | ----- | -------------------------- | ----------------------------------------------------------------- |
| `rozaya-boutique.com` | A     | `@`                        | `216.198.79.1`                                                    |
| `rozaya-boutique.com` | CNAME | `www`                      | `7e59913d9681b29a.vercel-dns-017.com.`                            |
| `rozayaboutique.com`  | A     | `@`                        | Not captured; expand this domain's DNS configuration in Vercel.   |
| `rozayaboutique.com`  | CNAME | `www`                      | Not captured; expand this hostname's DNS configuration in Vercel. |

Before applying these records, compare them with Vercel's current instructions.
Use Vercel's copy button for the CNAME target. Do not assume the non-hyphenated
domain uses the same values: its instructions were collapsed in the screenshot.
The trailing dot denotes a fully qualified DNS name; if Squarespace normalizes
it away when saving, that alone is not an error.

This section records the initial DNS instructions, not the current domain
status. A later read-only audit found all four custom hosts serving the site
over HTTPS; the canonical configuration above supersedes the former undecided
primary-domain state.

## Replace Squarespace's website preset

1. Open [Squarespace Domains](https://account.squarespace.com/domains), select
   the correct domain, and open **DNS settings**. Save a screenshot or export of
   the existing records before editing.
2. The **Squarespace Defaults** rows are managed as a preset rather than edited
   individually. Use the trash-can icon on that preset to remove its website
   records. Check the confirmation carefully: remove the preset, not the domain
   registration or unrelated DNS groups.
3. Under **Custom records**, use **Add record** to enter the A and CNAME records
   Vercel specifies for that domain. Keep the default TTL and save both records.
4. Repeat for the other domain, using its own Vercel instructions.

The old Squarespace website preset contained:

- Four A records at `@`: `198.185.159.144`, `198.185.159.145`,
  `198.49.23.144`, and `198.49.23.145`.
- A CNAME at `www` pointing to `ext-sq.squarespace.com`.
- An HTTPS record at `@` advertising Squarespace endpoints.

Do not leave those website records alongside their Vercel replacements. The
HTTPS record is a DNS record, not the website's certificate; removing the old
preset lets Vercel handle HTTPS for the connected website.

**Preserve existing nameservers, MX/email records, SPF/DKIM/DMARC records, and
unrelated TXT or verification records.** There is no need to transfer the domains
or switch DNS providers for this approach. Adding these public DNS values to Git
does not apply them to Squarespace.

## Verify the result

Open the project's domain configuration in Vercel. The direct settings link is
<https://vercel.com/rozaya-boutique/rozaya-boutique/settings/domains>; if the UI
redirects, find **Domains** in the project's main navigation.

Wait for each hostname to show **Valid Configuration** and for HTTPS certificate
provisioning to complete. Check public DNS from PowerShell:

```powershell
Resolve-DnsName -Name rozaya-boutique.com -Type A -Server 1.1.1.1
Resolve-DnsName -Name www.rozaya-boutique.com -Type CNAME -Server 1.1.1.1
Resolve-DnsName -Name rozayaboutique.com -Type A -Server 1.1.1.1
Resolve-DnsName -Name www.rozayaboutique.com -Type CNAME -Server 1.1.1.1
```

Compare the answers with each domain's current Vercel instructions. DNS caches
can retain old answers: the Squarespace preset shown had a four-hour TTL.
Allow for propagation rather than repeatedly changing correct records.

Visit all four HTTPS addresses, including from a phone on mobile data. Confirm
that the primary host displays the storefront and the other three permanently
redirect to the same path/query on `https://rozaya-boutique.com`, not the
Squarespace placeholder. The application redirect rules implement this routing;
avoid adding conflicting redirects back to an alias in Vercel.

DNS and HTTPS success do not establish that payments, shipping, taxes or checkout
are ready. Verify Shopify commerce settings and use payment test mode before
testing an order.
