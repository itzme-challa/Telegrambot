import { Context } from 'telegraf';
import axios from 'axios';

export const buyMaterial = () => async (ctx: Context) => {
  const telegramId = ctx.from?.id;
  const name = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
  const phone = '9999999999'; // Optional: Collect via conversation if needed
  const email = 'user@example.com'; // Optional: Collect via conversation

  const orderId = `order_${telegramId}_${Date.now()}`;
  const returnUrl = 'https://your-domain.com/success'; // Customize
  const notifyUrl = 'https://your-vercel-app.vercel.app/api/cashfree';

  const body = {
    customer_details: {
      customer_id: `${telegramId}`,
      customer_name: name,
      customer_email: email,
      customer_phone: phone
    },
    order_id: orderId,
    order_amount: 1, // Change to actual amount
    order_currency: 'INR',
    order_note: 'Study Material Access',
    return_url: returnUrl,
    notify_url: notifyUrl
  };

  try {
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders', body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!
      }
    });

    const paymentLink = response.data.payment_link;
    await ctx.reply(`Click the link below to complete your payment:\n${paymentLink}`);
  } catch (err) {
    console.error('Cashfree error:', err.response?.data || err.message);
    await ctx.reply('Failed to generate payment link. Please try again later.');
  }
};
