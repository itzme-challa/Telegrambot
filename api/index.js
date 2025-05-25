import { Telegraf } from 'telegraf';
import express from 'express';
import { config } from 'dotenv';
import { createOrder } from '../utils/createOrder.js';

config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

bot.start((ctx) => {
  ctx.reply('Welcome! Send /buy to purchase study material.');
});

bot.command('buy', async (ctx) => {
  const order = await createOrder({
    productId: '123',
    productName: 'NEET Biology Notes',
    amount: 99,
    telegramLink: 'https://t.me/joinchat/yourchannel',
    customerName: ctx.from.first_name,
    customerEmail: `user${ctx.from.id}@example.com`,
    customerPhone: '9999999999'
  });

  if (order?.paymentLink) {
    ctx.reply(`Pay here: ${order.paymentLink}`);
  } else {
    ctx.reply('Failed to create order. Please try again later.');
  }
});

// Mount webhook
app.post('/api/index.js', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (e) {
    console.error('Error handling update:', e);
    res.status(500).send('Error');
  }
});

export default app;
