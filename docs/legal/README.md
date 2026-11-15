# Legal documents: draft, generate, review, publish

Generation is local only. It does not change Shopify, publish a policy, or certify
legal compliance. The current draft text and operational publication gates still
require approval; completing tokens alone is not enough.

## Files

```text
docs/legal/
  drafts/
    terms-of-service.md
    privacy-policy.md
  tokens.example.json          # Shared mapping template, no personal values
  tokens.local.json            # Your completed mapping, ignored by Git
  Generate-LegalDocuments.ps1
  final/                       # Generated files, ignored by Git
  terms-review-notes.md
  privacy-review-notes.md
```

The draft folder contains only policy templates. The review notes remain outside
it and are never generated as customer-facing policies. Each template has one
marked `REVIEW-ONLY` block that the generator removes deliberately, not by
stripping arbitrary paragraphs or blockquotes.

## 1. Complete the shared mapping

From the repository root, using **PowerShell 7** (`pwsh`, not Windows PowerShell
5.1), make a local copy if it does not already exist:

```powershell
if (-not (Test-Path -LiteralPath .\docs\legal\tokens.local.json)) {
  Copy-Item .\docs\legal\tokens.example.json .\docs\legal\tokens.local.json
}
```

Do not overwrite a previously completed local file. Edit `tokens.local.json`:

| Token                     | Value to supply                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `LEGAL_OPERATOR_NAME`     | The approved legal person/entity operating Rozaya Boutique, not an invented company form.           |
| `SUPPORT_EMAIL`           | A working, monitored public support address. Do not use untested forwarding.                        |
| `PRIVACY_CONTACT_EMAIL`   | The monitored address for privacy requests; it can equal support if that is the actual arrangement. |
| `BUSINESS_POSTAL_ADDRESS` | The approved complete business disclosure address, including postal code and country.               |
| `CUSTOMER_SUPPORT_PHONE`  | The genuine customer-support number approved for disclosure.                                        |
| `REFUND_POLICY_URL`       | Verified absolute HTTPS return/refund policy URL.                                                   |
| `SHIPPING_POLICY_URL`     | Verified absolute HTTPS shipping policy URL.                                                        |
| `PRIVACY_POLICY_URL`      | Verified absolute HTTPS privacy policy URL.                                                         |
| `CONTACT_INFORMATION_URL` | Verified absolute HTTPS contact-information URL.                                                    |
| `PRIVACY_CHOICES_URL`     | Verified absolute HTTPS privacy-controls URL on the custom storefront.                              |

No business facts or canonical domain are guessed. The example values are empty
intentionally; the generator reports every missing value. Use literal single-line
text, not Markdown or HTML, for business details. JSON requires `\"` for a quote
inside a string and `\\` for a literal backslash. The generator safely escapes
text when rendering, so names containing `&`, `$`, or brackets remain data.

**Do not add `EFFECTIVE_DATE`.** The generator computes it once per run from this
machine's current local date in `yyyy-MM-dd` format. Check the clock/time zone and
generate on the intended effective date. If publication is delayed, regenerate
when appropriate; generating today does not make a later publication retroactive.

Policy and privacy-choice links must be absolute HTTPS URLs because Shopify's
policy/checkout host may differ from the headless storefront's host. Do not use a
Markdown preview service URL. The controls and policy pages must be deployed and
publicly usable before their links are published in Shopify. Relative paths and
untested domain aliases are not publication-ready substitutes.

`tokens.local.json` and `final/` are Git-ignored because they may contain personal
contact details. Git ignore is not encryption or access control: protect local
files and backups. If using a custom mapping/output path, keep it outside Git or
add an appropriate ignore rule. Never put Shopify credentials in the mapping.

## 2. Review and generate

Read the [Terms handoff](terms-review-notes.md) and
[privacy handoff](privacy-review-notes.md), review both drafts and the actual
business practices, and obtain the required approvals. Then run:

```powershell
pwsh -NoProfile -File .\docs\legal\Generate-LegalDocuments.ps1 -Reviewed
```

`-Reviewed` is your explicit acknowledgment that you reviewed the text, values,
and gates. It does not provide legal approval or bypass the remaining gates.
PowerShell 7's built-in Markdown renderer is used; no extra packages or network
access are required.

Each policy produces:

- `NAME.md`: resolved Markdown for archival review.
- `NAME.html`: HTML **body fragment** for Shopify's HTML editor or a future
  approved Admin API update.
- `NAME.preview.html`: standalone UTF-8 browser preview. Open it to review the
  rendered headings, lists, emphasis, contact information, and links. Do not
  paste this entire preview's document wrapper into a Shopify policy field.

The generator validates all templates and token values before creating the
output set. It rejects unknown, duplicate, missing, or non-string token values,
manually configured dates, leftover placeholders, malformed review markers, and
unsafe/relative links. Existing output is never overwritten. All output files
are staged locally and moved into place together only after successful rendering.
Templates are trusted, reviewed Markdown source; this is not a general-purpose
sanitizer for arbitrary third-party HTML.

For another reviewed run, choose a fresh output directory under ignored `final/`
(after the first successful default generation, that parent exists):

```powershell
pwsh -NoProfile -File .\docs\legal\Generate-LegalDocuments.ps1 `
  -TokenFile .\docs\legal\tokens.local.json `
  -OutputDirectory .\docs\legal\final\revision-2 `
  -Reviewed
```

Do not delete an existing policy snapshot merely to rerun the generator. Store
the exact published version and publication date securely as part of your
business records.

## 3. Install in Shopify — a separate, approved action

There is no automatic link between this folder and Shopify's saved policies.
Committing or deploying these files does not install them. The storefront reads
Shopify's saved policy objects; review its footer pages and Shopify checkout after
an approved policy change.

### Shopify Admin interface

1. Back up/export the current policy and any translations before replacing it.
2. In Shopify Admin, open **Settings → Policies**, then the matching policy.
3. Review that policy's automation setting. Installing custom wording may require
   turning off automated updates for that policy; explicitly approve that change
   first. Do not disable the cookie banner, opt-out settings, or Network
   Intelligence as part of installing policy text.
4. Paste `NAME.html` into the editor's HTML view where available, or copy the
   rendered policy body from the preview into the rich-text editor. **Do not
   paste raw Markdown or upload a Markdown-preview link.** Check Shopify's
   resulting formatting and actual link destinations before saving.
5. Save only the approved policy. Verify it without an administrator session on
   the storefront, checkout, and relevant languages. Recheck privacy automation
   behavior so it does not unexpectedly replace approved custom wording.

### Could the assistant publish it instead?

Shopify supports the GraphQL Admin API
[`shopPolicyUpdate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/shopPolicyUpdate)
with the **`write_legal_policies`** scope. A future explicitly authorized publishing
step could use that API after backing up the old text, checking permissions and
automation, submitting only the approved HTML, checking `userErrors`, and
verifying the saved content. This generator intentionally contains no API calls
and no publication credentials.

The current storefront credentials do not grant this Admin permission, and the
available tools do not provide an authenticated Shopify Admin browser session.
So publication currently requires you to use the Shopify interface. API-assisted
publication is possible later with explicit approval and suitable Admin access
configured securely outside source control; do not paste an Admin token into
chat or the token mapping. API support does not itself establish legal approval
or resolve Shopify automation settings.

See Shopify's [policy installation and automation documentation](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos).
The incomplete saved Terms, checkout `/password` redirect, regional/domain
privacy checks, and other previously documented launch gates remain unresolved.

## Test the generator

```powershell
pwsh -NoProfile -File .\tests\legal-generation.test.ps1
```

The tests use isolated temporary directories and fictional values. They never
generate publishable business documents in `docs/legal/final` or call Shopify.
