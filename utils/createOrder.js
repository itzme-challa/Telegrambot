import axios from 'axios';

export async function createOrder({ productId, productName, amount, telegramLink, customerName, customerEmail, customerPhone }) {
  const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    const res = await axios.post(
      'https://api.cashfree.com/pg/orders',
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'cust_' + productId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: `${process.env.BASE_URL}/success?order_id={order_id}&product_id=${productId}`
        },
        order_note: telegramLink
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
        }
      }
    );

    const sessionId = res.data.payment_session_id;
    const paymentLink = `https://www.cashfree.com/checkout/post/submit?payment_session_id=${sessionId}`;

    return { paymentLink, orderId };
  } catch (err) {
    console.error('Error creating order:', err.response?.data || err.message);
    return null;
  }
}
