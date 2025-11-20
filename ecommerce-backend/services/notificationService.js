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

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: "Your TN16 order is confirmed",
      html: customerHtml,
    }),
    sendWhatsApp({
      to: user.mobileNumber ? `whatsapp:${user.mobileNumber}` : null,
      body: `Hi ${user.name}, your TN16 order (${order.id}) totaling ₹${order.total.toFixed(
        2
      )} is confirmed.`,
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

