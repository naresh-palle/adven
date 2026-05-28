/**
 * Mock email system that simulates sending messages, logging them beautifully to the console/logs.
 */

const sendEmailMock = async (type, to, subject, details) => {
  const line = '='.repeat(60);
  console.log(`\n${line}`);
  console.log(`[EMAIL DISPATCH] - TYPE: ${type}`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`${line}`);
  console.log('CONTENT:');
  console.log(JSON.stringify(details, null, 2));
  console.log(`${line}\n`);
  return { success: true, messageId: `mock_${Math.random().toString(36).substring(7)}` };
};

const sendOrderConfirmation = async (email, order) => {
  return await sendEmailMock('ORDER_CONFIRMATION', email, `Adven - Order Confirmation #${order._id}`, {
    orderId: order._id,
    totalAmount: `₹${order.totalPrice}`,
    items: order.orderItems.map((i) => `${i.name} (Size: ${i.size}) x${i.quantity}`),
    shippingAddress: order.shippingAddress,
  });
};

const sendShippingUpdate = async (email, order, status) => {
  return await sendEmailMock('SHIPPING_UPDATE', email, `Adven - Shipping Update: Order #${order._id} is ${status}`, {
    orderId: order._id,
    newStatus: status,
    trackingLogs: order.trackingLogs,
  });
};

const sendContactForm = async (senderEmail, name, message) => {
  return await sendEmailMock('CONTACT_FORM_SUBMISSION', 'support@adven.com', `Adven Support - Contact Form from ${name}`, {
    senderName: name,
    senderEmail,
    message,
  });
};

module.exports = {
  sendOrderConfirmation,
  sendShippingUpdate,
  sendContactForm,
};
