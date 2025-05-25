const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const products = [
  { id: 1, name: 'NCERT Biology 11', amount: 99, telegramLink: 'https://t.me/joinchat/xxxxx' },
  { id: 2, name: 'NCERT Chemistry 12', amount: 129, telegramLink: 'https://t.me/joinchat/yyyyy' }
];

bot.start((ctx) => {
  let msg = 'Welcome! Please choose a product to purchase:\n\n';
  products.forEach(p => {
    msg += `• ${p.name} - ₹${p.amount}\n/send_${p.id}\n\n`;
  });
  ctx.reply(msg);
});

products.forEach((product) => {
  bot.command(`send_${product.id}`, async (ctx) => {
    const user = ctx.from;
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      const response = await axios.post('https://api.cashfree.com/pg/orders', {
        order_id: orderId,
        order_amount: product.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `tg_${user.id}`,
          customer_name: user.first_name || 'TelegramUser',
          customer_email: `${user.id}@example.com`,
          customer_phone: '9999999999'
        },
        order_meta: {
          return_url: `${process.env.BASE_URL}/success?order_id={order_id}&product_id=${product.id}`
        },
        order_note: product.telegramLink
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
        }
      });

      const paymentLink = `https://www.cashfree.com/checkout/post/redirect?payment_session_id=${response.data.payment_session_id}`;
      ctx.reply(`Click to Pay: ${paymentLink}`);
    } catch (error) {
      console.error('Payment Error:', error?.response?.data || error.message);
      ctx.reply('Error creating payment. Please try again later.');
    }
  });
});

module.exports = (req, res) => {
  if (req.method === 'POST') {
    bot.handleUpdate(req.body, res);
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
