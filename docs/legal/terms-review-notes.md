# Terms of Service: counsel and owner handoff

**Status:** revised review draft, not legal approval or authorization to publish.
Read with [the revised Terms of Service](drafts/terms-of-service.md). Prepared from the
owner-supplied 25-section template, the storefront source inspected during this
conversation, and Shopify administration screenshots. No live policy, DNS,
payment setting, or application code has been changed by these documents.

This is not a legal opinion, jurisdiction-by-jurisdiction compliance assessment,
or substitute for reviewing the merchant's actual provider agreements. Counsel
must decide whether the resulting risk allocation and required disclosures are
appropriate. No claim is made that this document is "perfect" or that every
country in an active market can lawfully be served.

## 1. Facts used in the draft

### Owner-confirmed business choices

- The business operates in California, United States, under Rozaya Boutique.
  Its legal operator's exact identity and entity form have not been confirmed.
- International shipping is intended; this supersedes the initial US/Canada-only
  plan. International shipping and Markets settings are broad, not a guarantee of
  product or destination eligibility.
- Eligible full-price goods have a voluntary 30-day return-request window after
  delivery. Customers pay change-of-mind return shipping. Sale items are final
  sale for discretionary returns. Original outbound shipping charges are retained
  except where law requires a refund. These choices do not displace mandatory
  rights, including eligible EU withdrawal or remedies for nonconforming goods.
- Handling is 2–3 business days, with processing/dispatch Monday–Friday excluding
  holidays. Express does not independently promise faster handling.
- The owner accepted the revised refund draft and reported completing the shipping
  policy. Saved versions, removed placeholders, and public accessibility have not
  been independently verified.

### Configuration/source observations, not operational certification

- Next.js pages are hosted on Vercel; Squarespace holds domain registration/DNS;
  Shopify supplies catalog/cart/checkout and related commerce services.
- Shopify Payments displays "Accepting payments" and "Receiving payouts." No test
  purchase, refund, capture configuration, or payout has been verified.
- US and Rest of World markets are Active. Rest of World is Managed, covering 188
  regions, with local currencies and region-based duty/tax-inclusive pricing.
- Managed Markets screens identify the merchant-of-record arrangement and managed
  tax collection. They do not establish domestic US tax compliance, total fees,
  product compliance, or supported operation of this particular headless channel.
- The current catalog contains test products. Customs shows 4 supported, 20
  partially supported, and 1 unsupported item. The unsupported abalone earrings
  have animal/plant-material and jewelry restrictions across the market. Do not
  alter truthful descriptions to evade review or claim production eligibility.
- Customer email currently uses Gmail. Squarespace forwarding was selected, but
  delivery/replies and the public alias have not been confirmed. Shopify shows
  its expected `shopifyemail.com` sender fallback for Gmail. Incoming forwarding
  alone is not domain-authenticated outbound email.
- Existing code renders Shopify Pages, not Shopify policy objects. The custom
  footer has no policy/contact links. No policy-object query, contact-form, or
  consent integration was found in the inspected application code. Shopify theme
  settings do not automatically establish those features in Next.js.
- Country-context integration (`inContext`, `buyerIdentity`, `countryCode`) was
  not found in `lib/shopify`. This is an unresolved implementation check, not a
  completed audit proving that Managed Markets cannot work with the storefront.

## 2. Complete these publication tokens

Do not publish while any `{{TOKEN}}` remains. Do not fill unknown values with
guessed facts, untested aliases, or invented company forms.

| Token                         | Required completion                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `{{EFFECTIVE_DATE}}`          | Actual approved publication/effective date, not a retrospective date.                                                      |
| `{{LEGAL_OPERATOR_NAME}}`     | Correct contracting legal person/entity; confirm its relationship to the trading name. Appears twice.                      |
| `{{SUPPORT_EMAIL}}`           | A monitored, verified public support address. Keep a working Gmail if forwarding remains untested.                         |
| `{{BUSINESS_POSTAL_ADDRESS}}` | Complete, appropriate lawful disclosure address including postal code and country; evaluate physical-address requirements. |
| `{{CUSTOMER_SUPPORT_PHONE}}`  | Genuine customer-contact number; counsel must resolve applicable disclosure obligations before omitting it.                |
| `{{REFUND_POLICY_URL}}`       | Verified public Return and Refund Policy URL.                                                                              |
| `{{SHIPPING_POLICY_URL}}`     | Verified public Shipping Policy URL.                                                                                       |
| `{{PRIVACY_POLICY_URL}}`      | Verified public, reviewed Privacy Policy URL.                                                                              |
| `{{CONTACT_INFORMATION_URL}}` | Verified public Contact Information URL.                                                                                   |

The [generation workflow](README.md) uses a shared local token file and fills
`EFFECTIVE_DATE` with the generation machine's current date. Generate on the
intended effective date; generation does not mean publication or legal approval.

Policy destinations deliberately are tokens, not speculative Next.js routes or
claims that a `myshopify.com` path works. Confirm actual pages or implement and
verify the integration first. Test links from the storefront, checkout, and
customer messages, including on mobile and without an administrator session.

If a phone/address field must be changed, revise the sentence and all related
policies consistently; do not leave a blank label. Avoid placing private home or
personal contact information in Git merely to complete this review copy. Use a
restricted publication workflow for actual details where appropriate, while
still meeting required public disclosures.

## 3. Material changes to the original template

| Sections            | Revision and reason                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview, 9, 10     | Identify Vercel hosting, Shopify commerce, and conditional Global-e merchant-of-record role. Remove the claim that all pages are hosted by Shopify or that every sale is directly with the boutique.          |
| Overview, 1, 10, 24 | Replace blanket browsing/continued-use assent and purported privacy consent with legally sufficient notice/acceptance and separate privacy choices.                                                           |
| 2, 16               | Preserve listing accuracy, conformity, express descriptions, and statutory guarantees. Do not describe all jewelry or vintage goods as automatically "as is."                                                 |
| 3, 12               | Replace unlimited cancellation and retrospective repricing powers with legitimate reasons, notice, lawful acceptance/cancellation and timely refunds.                                                         |
| 3                   | Reflect the approved returns choices but preserve statutory rights, including EU withdrawals on eligible discounted purchases. Require conspicuous final-sale disclosure.                                     |
| 4                   | Accommodate regional currencies and tax/duty-inclusive Managed Markets pricing without promising prepaid duties everywhere or allowing undisclosed merchant fees.                                             |
| 5                   | Separate handling and transit, remove blanket carrier-handoff risk transfer, and preserve delay-consent/cancellation/refund and destination-specific delivery protections.                                    |
| 6–8                 | Retain ownership/third-party distinctions without claiming provider use removes the merchant's own legal responsibilities or overriding lawful accessibility/fair-use rights.                                 |
| 9                   | Retain Shopify's platform-not-seller distinction and a qualified relationship release, but remove blanket immunity and reconcile Global-e. Provider-required wording remains a counsel/Shopify approval gate. |
| 11                  | Limit public-content permission, protect honest reviews, and avoid treating private support evidence as a perpetual advertising license.                                                                      |
| 13–14               | Resolve the blanket automation ban versus allowed-agent contradiction. Allow ordinary assistive/browser functions while prohibiting abuse and unauthorized access.                                            |
| 15                  | Preserve existing-order, refund, privacy, and other accrued rights despite account suspension.                                                                                                                |
| 17–18               | Remove total liability exclusions and unlimited consumer indemnification. Preserve nonexcludable liabilities; do not invent a dollar cap or compulsory defense obligation.                                    |
| 19–22               | Remove automatic anti-customer interpretation and unrestricted adverse assignment; separate California choice of law from nonexclusive forums while preserving mandatory residence protections.               |
| 24–25               | Use prospective changes, preserve prior orders, and consolidate real contact details. Remove merchant-only editorial notes and literal template artifacts from publication copy.                              |

## 4. Counsel decisions and provider confirmation

1. **Legal identity and disclosures:** confirm operator, business form, permitted
   trading name, physical/postal address and telephone. Assess California online
   service disclosures, including Civil Code section 1789.3, and any required
   complaint-contact wording. That statute's official page was inaccessible
   during this research; its applicability and current required text are not
   represented as verified here. Assess additional disclosures for countries
   actually served, not merely listed in Markets.
2. **Shopify/Global-e terms:** the supplied template calls Section 9 Shopify-specific.
   The revision intentionally changes its unconditional "all sales direct" claim
   and broad release to match the observed merchant-of-record arrangement and
   mandatory rights. Counsel and Shopify must confirm the permitted final wording
   against the merchant's actual agreements. Do not replace, hide, or paraphrase
   the required Global-e disclosure inside the applicable checkout. Confirm the
   correct Global-e contracting entity and any required link/addendum rather than
   assuming one entity serves every customer.
3. **Acceptance and payment:** approve Section 3's proposed acceptance rule and
   verify that the actual checkout/confirmation emails distinguish receipt from
   acceptance consistently. Confirm capture, refund/void timing and any necessary
   amendments for domestic versus managed transactions. An unimplemented contract
   formation workflow cannot be fixed by words alone.
4. **Consumer rights and returns:** assess California, other US states, Canada,
   EU/EEA, UK and other enabled destinations as applicable. Confirm withdrawal
   information/forms, deadlines, warranty/remedy language, final-sale disclosures,
   and exceptions to retained outbound charges. The existing EU 14-day automation
   must not undercut a more generous applicable full-price 30-day promise. Do not
   add a blanket earrings/hygiene exception or restocking/label deduction without
   a lawful, accurate basis and business approval. The store must not ship to an
   unsupported market simply because its name appears in a catch-all zone.
5. **Risk allocation:** Sections 16–18 intentionally avoid blanket product-warranty
   disclaimers, total immunity, a numerical damages cap or unlimited indemnity.
   Confirm commercial acceptability, insurance interaction, and enforceability.
   No arbitration requirement, class waiver, artificial claims deadline, foreign
   exclusive venue, or restocking fee has been silently added.
6. **Privacy and marketing:** the automated Privacy Policy has not been reviewed.
   Verify actual logs, cookies, analytics/pixels, transfers, processors, Shopify
   and Vercel roles, Global-e flows, rights-request handling and marketing choices.
   Do not infer CCPA applicability solely from a California address or use a
   generic consent banner as evidence of compliance. Assess consent/preference
   signals and email marketing rules for the actual audiences, including Canada.
7. **Product compliance:** verify real materials, provenance/era claims, weights,
   customs classification/origin, value, insurance and carrier exclusions. Assess
   jewelry-specific advertising, metals/chemical/safety and destination rules,
   including relevant California requirements and EU product obligations. The
   Terms do not certify authenticity or substitute for testing or disclosures.
8. **Automation and content:** approve the proposed distinction between permitted
   customer tools and abusive access. Align actual robots/access rules and honest
   review moderation with Sections 11, 13 and 14. Do not publish claims of review
   or account features that the storefront does not actually offer.

## 5. Publication and engineering gates

- Review and approve the Terms, Privacy Policy, Return and Refund Policy,
  Shipping Policy and Contact Information as one consistent set. Make the same
  approved texts available wherever Shopify or the custom storefront uses them.
- Verify the actual return and shipping policies match the summaries; no
  unapproved shipping clawbacks, handling promises, or exceptions should appear.
- Confirm whether Shopify policy automation is enabled. Export a backup before
  replacing content; prevent later template automation from silently overwriting
  the approved custom language. Do not disable privacy automation indiscriminately.
- Provide conspicuous notice/acceptance where required, accessible legal links,
  final-sale notices before purchase, and an accessible way to retain terms and
  order details. Do not assume a footer link alone establishes contractual assent.
- Establish version retention and the actual change-notification process before
  promising prior-order access and prospective changes in Section 24.
- Confirm eligibility of this headless/Storefront API setup with Managed Markets.
  Its requirements page was inaccessible during prior research, so compatibility
  remains unconfirmed. Verify actual buyer country, pricing, restricted catalog,
  merchant-of-record notices and refunds in checkout. Active market flags do not
  prove this integration works.
- Configure and verify necessary privacy mechanisms in Next.js; publishing a
  Shopify theme cookie setting does not establish custom-storefront consent.
- Test forwarding and reply delivery, Shopify domain-sender authentication,
  transactional emails, US and representative international checkout quotes,
  handling-aware delivery dates, test purchase, cancellation/refund, and fulfillment
  with approved test procedures. Do not bypass certificate/security warnings or
  place a real charge as a substitute for an agreed test plan.
- Remove the review banner, complete all tokens, format hyperlinks in Shopify's
  editor, inspect the public rendered pages, and record counsel/owner approval
  before publication. Keep this handoff out of customer-facing policy content.

## 6. Primary references consulted

These are issue-scoping sources, not a complete legal analysis or a claim that
the linked pages approve this draft. Recheck them and applicable law at approval.

- [Shopify: adding store policies](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos):
  templates do not guarantee compliance; automation can replace custom text;
  policy disclosures must match actual operations and use appropriate contacts.
- [Shopify: Managed Markets overview](https://help.shopify.com/en/manual/international/managed-markets/overview):
  Global-e role, required checkout disclosure, regional inclusive pricing, and
  exceptions to prepaid duties.
- [Shopify: prohibited/restricted Managed Markets items](https://help.shopify.com/en/manual/international/managed-markets/prohibited-items):
  destination restrictions, jewelry and shell-material limits.
- [FTC: Mail, Internet, or Telephone Order Merchandise Rule business guide](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule):
  reasonable shipping representations and required delay-consent/cancellation/
  refund procedures. The initially attempted shorter FTC URL was unavailable;
  this is the working guide used for the revision.
- [California Attorney General: refund policies](https://oag.ca.gov/consumers/general/refunds):
  limited/no-return disclosure and statutory warranty context; not authorization
  to deny mandatory remedies or treat every website disclosure as sufficient.
- [EU Your Europe: online and distance selling](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm):
  withdrawal/refund information, delivery obligations and carrier risk.
- [EU Your Europe: consumer returns](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm):
  withdrawal framework and disclosure of return costs.
- [Shopify Privacy Policy](https://www.shopify.com/legal/privacy):
  linked as a provider notice, not as a replacement for the store's own notice.
