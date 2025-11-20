import sgMail from "@sendgrid/mail";
import Twilio from "twilio";

const sendgridKey = process.env.SENDGRID_API_KEY;
if (sendgridKey) {
  sgMail.setApiKey(sendgridKey);
}
const sendgridFrom = process.env.SENDGRID_FROM_EMAIL;

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const safeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!sendgridKey || !sendgridFrom) {
    console.warn("[notifications] sendgrid missing configuration, skip email");
    return;
  }
  const recipients = safeArray(to);
  if (!recipients.length) return;
  await sgMail.send({
    to: recipients,
    from: sendgridFrom,
    subject,
    html,
  });
};

export const sendWhatsApp = async ({ to, body }) => {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
    console.warn("[notifications] twilio missing configuration, skip whatsapp");
    return;
  }
  const recipients = safeArray(to);
  if (!recipients.length) return;
  await Promise.all(
    recipients.map((recipient) =>
      twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: recipient.startsWith("whatsapp:")
          ? recipient
          : `whatsapp:${recipient}`,
        body,
      })
    )
  );
};

export const sendSMS = async ({ to, body }) => {
  if (!twilioClient) {
    console.warn("[notifications] twilio missing configuration, skip sms");
    return;
  }
  if (!to) return;
  
  // Format phone number: ensure it starts with +91
  let phoneNumber = to.toString().replace("whatsapp:", "").trim();
  if (!phoneNumber.startsWith("+")) {
    if (phoneNumber.startsWith("91")) {
      phoneNumber = "+" + phoneNumber;
    } else {
      phoneNumber = "+91" + phoneNumber;
    }
  }
  
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || 
    process.env.TWILIO_WHATSAPP_FROM?.replace("whatsapp:", "");
  
  if (!twilioFrom) {
    console.warn("[notifications] TWILIO_PHONE_NUMBER not configured, skip sms");
    return;
  }
  
  try {
    await twilioClient.messages.create({
      from: twilioFrom,
      to: phoneNumber,
      body,
    });
    console.log(`[notifications] SMS sent to ${phoneNumber}`);
  } catch (err) {
    console.error(`[notifications] SMS failed to ${phoneNumber}:`, err.message);
  }
};

const buildOrderSummaryTable = (order, items) => {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.Product?.name || "Item"}</td>
          <td>${item.quantity}</td>
          <td>₹${item.unitPrice.toFixed(2)}</td>
          <td>₹${(item.unitPrice * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="left">Qty</th>
          <th align="left">Unit</th>
          <th align="left">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px">
      <strong>Total:</strong> ₹${order.total.toFixed(2)}<br/>
      <strong>Tax:</strong> ₹${order.taxTotal.toFixed(2)}<br/>
      <strong>Shipping:</strong> ₹${order.shippingFee.toFixed(2)}
    </p>
  `;
};

export const notifyOrderPlaced = async ({
  order,
  user,
  items,
  shipping,
}) => {
  const summaryTable = buildOrderSummaryTable(order, items);
  const customerHtml = `
    <h2>Hi ${user.name}, your order is confirmed!</h2>
    <p>Order ID: ${order.id}</p>
    <p>Shipping to: ${shipping.address}, ${shipping.city}, ${shipping.state} - ${
    shipping.zip
  }</p>
    ${summaryTable}
    <p>We will update you when the order ships.</p>
  `;

  const adminHtml = `
    <h2>New order received</h2>
    <p><strong>Customer:</strong> ${user.name} (${user.email}${
    user.mobileNumber ? ` / ${user.mobileNumber}` : ""
  })</p>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
    <p><strong>Shipping:</strong> ${shipping.address}, ${shipping.city}, ${
    shipping.state
  } - ${shipping.zip}</p>
    ${summaryTable}
  `;

  const shopName = process.env.SHOP_NAME || "TN16 Tirupur Cotton";
  const customerSmsBody = `Hi ${user.name}, your order from ${shopName} (Order #${order.id.substring(0, 8)}) totaling ₹${order.total.toFixed(2)} is confirmed. We'll update you when it ships. Thank you for shopping with us!`;

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: "Your TN16 order is confirmed",
      html: customerHtml,
    }),
    // Send SMS to customer
    sendSMS({
      to: user.mobileNumber,
      body: customerSmsBody,
    }),
    sendWhatsApp({
      to: user.mobileNumber ? `whatsapp:${user.mobileNumber}` : null,
      body: customerSmsBody,
    }),
    sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAILS,
      subject: `New TN16 order ${order.id}`,
      html: adminHtml,
    }),
    sendWhatsApp({
      to:
        process.env.ADMIN_NOTIFICATION_WHATSAPP ||
        process.env.TWILIO_WHATSAPP_FROM,
      body: `New order ${order.id} from ${user.name} totaling ₹${order.total.toFixed(
        2
      )}.`,
    }),
  ]);
};

export const sendPasswordResetNotice = async ({ user, resetUrl }) => {
  const html = `
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the link below to continue.</p>
    <p><a href="${resetUrl}" target="_blank" rel="noopener">Reset password</a></p>
    <p>If you didn't request this, please ignore.</p>
  `;
  await sendEmail({
    to: user.email,
    subject: "Reset your TN16 password",
    html,
  });
  if (user.mobileNumber) {
    await sendWhatsApp({
      to: `whatsapp:${user.mobileNumber}`,
      body: `Reset your TN16 password: ${resetUrl}`,
    });
  }
};

export const notifyOrderStatusUpdate = async ({
  order,
  user,
  oldStatus,
  newStatus,
  oldPaymentStatus,
  newPaymentStatus,
}) => {
  const shopName = process.env.SHOP_NAME || "TN16 Tirupur Cotton";
  const orderIdShort = order.id.substring(0, 8);

  // Only notify if status actually changed
  const statusChanged = newStatus && newStatus !== oldStatus;
  const paymentStatusChanged = newPaymentStatus && newPaymentStatus !== oldPaymentStatus;

  if (!statusChanged && !paymentStatusChanged) return;

  let emailSubject = "";
  let emailBody = "";
  let smsBody = "";

  if (statusChanged) {
    const statusMessages = {
      pending: "is being processed",
      confirmed: "has been confirmed",
      shipped: "has been shipped",
      delivered: "has been delivered",
      cancelled: "has been cancelled",
      failed: "has failed",
    };

    emailSubject = `Your TN16 Order ${orderIdShort} - ${newStatus.toUpperCase()}`;
    emailBody = `
      <h2>Order Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>#${orderIdShort}</strong> ${statusMessages[newStatus] || `is now ${newStatus}`}.</p>
      <p><strong>Order Total:</strong> ₹${order.total.toFixed(2)}</p>
      <p>We'll keep you updated on any further changes.</p>
      <p>Thank you for shopping with ${shopName}!</p>
    `;

    smsBody = `Hi ${user.name}, your ${shopName} order #${orderIdShort} ${statusMessages[newStatus] || `is now ${newStatus}`}. Total: ₹${order.total.toFixed(2)}. Thank you!`;
  }

  if (paymentStatusChanged) {
    const paymentMessages = {
      paid: "payment has been confirmed",
      failed: "payment failed",
      processing: "payment is being processed",
      requires_payment: "payment is required",
    };

    if (!statusChanged) {
      emailSubject = `Your TN16 Order ${orderIdShort} - Payment Update`;
      emailBody = `
        <h2>Payment Status Update</h2>
        <p>Hi ${user.name},</p>
        <p>Your order <strong>#${orderIdShort}</strong> ${paymentMessages[newPaymentStatus] || `payment is now ${newPaymentStatus}`}.</p>
        <p><strong>Order Total:</strong> ₹${order.total.toFixed(2)}</p>
        <p>Thank you for shopping with ${shopName}!</p>
      `;
      smsBody = `Hi ${user.name}, your ${shopName} order #${orderIdShort} ${paymentMessages[newPaymentStatus] || `payment is now ${newPaymentStatus}`}. Thank you!`;
    } else {
      // Append payment info if status also changed
      emailBody += `<p><strong>Payment Status:</strong> ${newPaymentStatus}</p>`;
      smsBody += ` Payment: ${newPaymentStatus}.`;
    }
  }

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    }),
    sendSMS({
      to: user.mobileNumber,
      body: smsBody,
    }),
  ]);
};

