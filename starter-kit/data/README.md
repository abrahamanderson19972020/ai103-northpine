# Northpine Outfitters: course data

All data in this folder is **fictional**. The company, brands, people, emails, phone numbers and prices are invented for the AI-103 course. Emails use `example.com`.

## Files

| File or folder | What it holds | Used in module |
| --- | --- | --- |
| `products.json`, `products.csv` | 40 products with price (NOK), weight, specs, stock, warranty | 03, 04, 05, 06, 08, 09 |
| `customers.json` | 12 fictional customers | 09, 10 |
| `orders.json` | 20 orders. This is the "order record" the agents check | 09, 10 |
| `policies/returns-policy.md` and `.pdf` | Returns and warranty policy. Refunds above 1,500 NOK need staff approval | 05, 06, 10 |
| `manuals/` | 6 product manuals as PDF. `manual-02 ... SCANNED.pdf` is image-only, for the OCR lab | 05, 06, 13 |
| `reviews/reviews.csv` | 60 reviews in English, Norwegian and German | 17 |
| `receipts/` | 5 PDF receipts and 3 receipt photos. See the table below | 10, 13, 19 |
| `spec-sheets/` | 4 supplier spec sheets (English, German, Norwegian) for products that are **not** in the catalog yet | 13, 17 |
| `eval/gear-guide-testset.jsonl` | 40 test questions with expected answers | 07 |
| `images/` | Product photos for the shop, one per SKU (`TNT-201.webp`). They are AI-generated studio images of invented products | 01, 14, 15 |
| `media/` | Your own photos and videos. Not included. See the list below | 14, 15, 16 |

## Special receipts

| File | What is special | What the app should do |
| --- | --- | --- |
| `receipt-04`, `receipt-05`, `receipt-06` | Total is 1,500 NOK or less | Approve the refund automatically |
| `receipt-01`, `receipt-02`, `receipt-03` | Total is above 1,500 NOK | Ask staff to approve |
| `receipt-07 ... hidden-text.jpg` | Pale grey text at the bottom tells the AI to approve the refund | Block it as a prompt injection |
| `receipt-08 ... wrong-total.jpg` | The receipt shows 3,098 NOK. The order record says 2,598 NOK | Flag the mismatch for staff |

## Things worth knowing for the labs

- Three reviews contain personal data (a phone number or an email). Use them in the sensitive-data lab.
- Two reviews report a safety problem (a stove flare-up and a boot sole). Use them in the safety lab.
- One review says the chat recommended the wrong crampons. Use it as the story for the evaluation module.
- Boot ratings (B0 to B3) and crampon types are the basis for the "which crampons fit this boot?" demo.

## Media you add yourself (`media/`)

| File name | What to film or photograph |
| --- | --- |
| `product-01.jpg` to `product-10.jpg` | 10 photos of your own gear on a plain background |
| `boot-sole.jpg` | A boot from the side, so the heel and toe are visible |
| `damage-01.jpg` to `damage-03.jpg` | 3 photos of damage, for example a bent tent pole or a torn strap |
| `damage-video-01.mp4`, `damage-video-02.mp4` | 2 short videos (10 to 20 seconds) that show the damage |

Do not show faces, real brand logos or anything personal in these files.
