# DesignMyCase

**A store where the product is your own photo.** Upload a picture, place it on a live phone mockup, pick the model, material and finish while the price updates, and pay with Stripe.

My capstone project for Computer Systems Technology at Mohawk College (2025).

**Live:** [sujan-capstone.vercel.app](https://sujan-capstone.vercel.app)

## What it does

- **Design a case.** Upload an image (drag and drop, stored on S3), then drag and resize it on a device mockup in the canvas editor. Choose the phone model, colour, material and finish; the price updates with every choice. Preview the result, then check out.
- **Pay with Stripe.** Checkout runs through Stripe, and a webhook confirms the order before it shows up in the account and the admin dashboard.
- **Accounts.** Email and password or Google sign-in with Better Auth, email verification and password reset. Shoppers see their orders, favourite designs and unfinished designs they can pick up later, and can get reminder emails for designs they left behind.
- **Gallery.** Featured designs and a gallery of images to start from.
- **Admin dashboard.** Revenue and order charts over time, orders with status updates, customers, the product catalogue (models, materials, finishes and colours, each switchable on and off) and moderation of uploaded images.

## By the numbers

| 24 pages | 46 API routes | 200+ tests |
| --- | --- | --- |

Jest and React Testing Library tests run in GitHub Actions on every push.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · PostgreSQL · Better Auth · Stripe · AWS S3 · TanStack Query and Table · React Hook Form · Zod · Tailwind CSS · Radix UI · Recharts · Nodemailer · Jest · Playwright

## Run it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Jest
```

Create a `.env` file with these variables:

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Sessions and auth callbacks |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `EMAIL_VERIFICATION_CALLBACK_URL`, `GMAIL_USER`, `GMAIL_PASS` | Verification, reset and reminder emails |
| `AWS_S3_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY` | Image uploads |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments and order confirmation |
| `CRON_SECRET` | Protects the scheduled reminder job |
| `NEXT_PUBLIC_BASE_URL` | Links in emails and redirects |
| `TEST_USER_USERNAME`, `TEST_USER_PASSWORD` | Signed-in Playwright setup |

The database schema isn't scripted in this repo yet, so a fresh database needs its tables created before the app can run.

## Where things live

- `src/app/(site)` shopper pages: design flow, gallery, account, orders
- `src/app/(admin)` the admin dashboard
- `src/app/(authentication)` sign-in, sign-up, verification and password reset
- `src/app/api` route handlers, grouped by feature
- `src/lib` database, email, Stripe and shared helpers

Built by [Sujan Rokad](https://sujanrokad.com).
