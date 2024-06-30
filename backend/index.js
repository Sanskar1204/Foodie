const express = require("express");
const app = express();
const port = 5000;
const mongoDB = require("./db");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

mongoDB();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", require("./Routes/CreateUser"));
app.use("/api", require("./Routes/DisplayData"));
app.use("/api", require("./Routes/OrderData"));

// Razorpay integration
const razorpay = new Razorpay({
  key_id: "rzp_test_Jlz5q9bfq8PpEh",
  key_secret: "uyX5HxoXVso3RKchKfLNr359",
});

app.post("/api/createOrder", async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency,
    receipt,
    notes,
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/verifyPayment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const secret = "uyX5HxoXVso3RKchKfLNr359";

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "failure" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
