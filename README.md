## FoodApp – Razorpay Payment Integration

A minimal Express server integrated with Razorpay to create payment orders, verify client-side payments, and receive webhooks. Includes a simple Bootstrap checkout page to test end-to-end.

### Features
- Create Razorpay orders from your server
- Verify payments using HMAC signature on the server
- Receive Razorpay webhooks with raw-body signature verification
- Public endpoint to expose only the public `key_id` to the client
- Static demo checkout page at `/` using Razorpay Checkout JS

### Tech stack
- Node.js + Express
- Razorpay Node SDK
- dotenv, cors
- Static demo UI with Bootstrap

---

### Prerequisites
- Node.js 18+ (or compatible LTS)
- A Razorpay account with test/live keys

### Local setup
1) Copy env template and fill your keys
```bash
cp .env.example .env
# Then edit .env and set:
# RAZORPAY_KEY_ID=rzp_test_xxx
# RAZORPAY_KEY_SECRET=xxx
# RAZORPAY_WEBHOOK_SECRET=whsec_xxx   # optional, required if using webhooks
# PORT=3000                           # optional
```

2) Install dependencies
```bash
npm install
```

3) Run the server
```bash
npm run start
# or
npm run dev
```

4) Open the demo UI
- Visit `http://localhost:3000` and click Pay Now

If the port is busy, set a custom `PORT` in `.env`.

---

### API Reference

- GET `/health`
  - Returns `{ ok: true }` to confirm the server is running.

- GET `/api/config/public-key`
  - Response: `{ keyId: "<RAZORPAY_KEY_ID>" }`
  - Used by the demo page to initialize Razorpay Checkout.

- POST `/api/payments/create-order`
  - Body JSON:
    ```json
    { "amount": 49900, "currency": "INR", "receipt": "rcpt_123", "notes": { "orderId": "abc" } }
    ```
    - `amount` is required and must be in the smallest currency unit (paise for INR)
  - Response: `{ order: { id, amount, currency, ... } }` (Razorpay order object)

- POST `/api/payments/verify`
  - Body JSON (sent from client after successful payment):
    ```json
    {
      "razorpay_order_id": "order_9A33XWu170gUtm",
      "razorpay_payment_id": "pay_29QQoUBi66xm2f",
      "razorpay_signature": "generated_signature"
    }
    ```
  - Response: `{ ok: true }` when HMAC signature matches; otherwise `{ ok: false }`

- POST `/api/payments/webhook`
  - Headers: `x-razorpay-signature: <signature>`
  - Body: Raw JSON from Razorpay (route is configured with `express.raw(...)`)
  - The server verifies the webhook signature against `RAZORPAY_WEBHOOK_SECRET`.
  - Return `200 OK` to acknowledge processing.

#### Example curl
```bash
# Create order (amount in paise)
curl -X POST http://localhost:3000/api/payments/create-order \
  -H 'Content-Type: application/json' \
  -d '{"amount": 49900, "currency": "INR"}'

# Verify (use values your client received after a successful payment)
curl -X POST http://localhost:3000/api/payments/verify \
  -H 'Content-Type: application/json' \
  -d '{
        "razorpay_order_id": "order_xxx",
        "razorpay_payment_id": "pay_xxx",
        "razorpay_signature": "xxx"
      }'
```

---

### Webhooks (recommended)
1) Expose your local server for testing (optional):
```bash
# Example using ngrok
ngrok http 3000
# Copy the https URL and set it in Razorpay dashboard as the webhook URL
```

2) In Razorpay Dashboard → Settings → Webhooks:
- Set the webhook URL to: `https://<your-domain>/api/payments/webhook`
- Add the same `RAZORPAY_WEBHOOK_SECRET` value to the dashboard
- Select relevant events (e.g., `payment.authorized`, `payment.captured`, `order.paid`)

3) In production, ensure HTTPS is used and your server returns 2xx quickly.

---

### Frontend demo
- Static page at `public/index.html`.
- Fetches `GET /api/config/public-key` to get the public key.
- Calls `POST /api/payments/create-order`, then opens Razorpay Checkout.
- On success, posts to `POST /api/payments/verify`.

---

### Environment variables
- `RAZORPAY_KEY_ID` (required)
- `RAZORPAY_KEY_SECRET` (required)
- `RAZORPAY_WEBHOOK_SECRET` (recommended for webhooks)
- `PORT` (optional, defaults to 3000)

---

### Deployment
Below are quick options; use any platform you prefer.

#### Render (simple)
1) Push this repo to GitHub
2) Create a new Web Service on Render, connect the repo
3) Runtime: Node
4) Build Command: `npm install`
5) Start Command: `npm run start`
6) Add environment variables from `.env`
7) Deploy and copy the Render URL (e.g., `https://your-app.onrender.com`)
8) In Razorpay dashboard, set webhook to `https://your-app.onrender.com/api/payments/webhook`

#### Railway
1) Create a new project → Deploy from repo
2) Add env vars from `.env`
3) Start command: `npm run start`
4) Copy the generated domain and configure webhooks as above

#### Other hosts
- Any Node host that runs `node src/server.js` will work
- Ensure the webhook route receives raw body (already configured)

---

### Working link
I cannot deploy from this environment. After you deploy (e.g., on Render/Railway), your working link will look like `https://your-app.onrender.com`. Share that URL if you want me to validate the flow end-to-end.

---

### Notes
- Razorpay amounts are in the smallest currency unit (₹1 → 100)
- Never expose `RAZORPAY_KEY_SECRET` to the client; use server endpoints
- Add your own persistence (e.g., save orders/payments in DB) as needed

