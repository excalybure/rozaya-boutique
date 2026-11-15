# Custom domain setup

This storefront runs on Vercel. Shopify provides the catalog, cart and checkout;
it does not host this Next.js application's pages. The domains are registered
with Squarespace, which also hosts their DNS.

The intended routing is:

```text
Custom domain -> Vercel storefront -> Shopify commerce APIs / checkout
```

## Recorded configuration

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

This document records the instructions, not a completed DNS change. No preferred
primary domain or redirects have been confirmed yet.

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
that they display the storefront or intentionally redirect to the chosen primary
domain, not the Squarespace placeholder. Once a primary domain is chosen,
configure the other three hostnames to redirect to it in Vercel.

DNS and HTTPS success do not establish that payments, shipping, taxes or checkout
are ready. Verify Shopify commerce settings and use payment test mode before
testing an order.
