const db = require("../db.js"); // MySQL connection
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const CALLBACK_URL = "http://localhost:8000/api/pg/callback";

// ✅ Generate SHA256 checksum
const generateChecksum = (data, endpoint) => {
  const string = data + endpoint + SALT_KEY;
  return crypto.createHash("sha256").update(string).digest("hex") + "###" + SALT_INDEX;
};

// ✅ Update transaction status in DB
const updateTransactionStatus = async ({ orderId, status, transactionId, paymentMethod, referenceId, message }) => {
  try {
    const sql = `
    UPDATE transactions 
    SET 
        status = ?, 
        transactionId = ?, 
        paymentMethod = ?, 
        referenceId = ?, 
        errorMessage = ?
    WHERE orderId = ?;
`;

    const [result] = await db.query(sql, [status, transactionId, paymentMethod, referenceId || null, message || null, orderId]);
    console.log("✅ Transaction update result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error updating transaction:", error);
    throw error;
  }
};

// ✅ Create order and store in DB
exports.createOrder = async (req, res) => {
  try {
    const { amount, mobile, bookingId } = req.body;
    if (!amount || !mobile) {
      return res.status(400).json({ success: false, message: "Amount and mobile number are required" });
    }
    
    const orderId = `ORD${Date.now()}`;
    const muid = `muid${Date.now()}`;
    
    const requestBody = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: muid,
      amount: amount * 100,
      redirectMode: "POST",
      redirectUrl: `${CALLBACK_URL}/?id=${orderId}`,
      mobileNumber: mobile,
      paymentInstrument: { type: "PAY_PAGE" },
    };
    
    const encodedBody = Buffer.from(JSON.stringify(requestBody)).toString("base64");
    const checksum = generateChecksum(encodedBody, "/pg/v1/pay");
    
    const response = await axios.post(`${PHONEPE_BASE_URL}/pg/v1/pay`, { request: encodedBody }, {
      headers: {
        "X-VERIFY": checksum,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    
    if (response.data.success) {
      const { transactionId, instrumentResponse } = response.data.data;
      const paymentUrl = instrumentResponse.redirectInfo.url;
      
      console.log("🔗 Payment URL:", paymentUrl);
      
      await db.query(
        `INSERT INTO transactions (orderId, bookingId, transactionId, amount, userMobile, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [orderId, bookingId, transactionId, amount, mobile, "PENDING"]
      );
      
      return res.json({ success: true, orderId, transactionId, paymentUrl });
    } else {
      return res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Handle PhonePe payment callback & update DB
exports.paymentCallback = async (req, res) => {
  try {
    const merchantTransactionId = req.query.id;
    console.log("🔍 Processing callback for transaction:", merchantTransactionId);

    const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const checksum = generateChecksum(endpoint, "");
    
    const response = await axios.get(`${PHONEPE_BASE_URL}${endpoint}`, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID,
      },
    });
    
    const { data, message } = response;
    console.log("📦 Callback Response:", data);
    
    await updateTransactionStatus({
      orderId: data.merchantTransactionId,
      status: data.state,
      transactionId: data.transactionId,
      paymentMethod: data.paymentInstrument?.type || "UNKNOWN",
      referenceId: data.authRefId,
      message,
    });
    
    return res.status(200).json({ success: true, message: "Transaction updated successfully" });
  } catch (error) {
    console.error("❌ Error in payment callback:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
