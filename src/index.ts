// src/index.ts
const { Telegraf } = require('telegraf');
const { about } = require('./commands');
const { greeting, search, stop, link, share } = require('./text');
const { VercelRequest, VercelResponse } = require('@vercel/node');
const { development, production } = require('./core');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL || '';

const bot = new Telegraf(BOT_TOKEN);

// Commands
bot.command('about', about());
bot.command('start', greeting());
bot.command('search', search());
bot.command('stop', stop());
bot.command('link', link());
bot.command('share', share());

// Handle text messages for forwarding to partner
bot.on('text', async (ctx) => {
  const chatId = ctx.message.chat.id.toString();
  const text = ctx.message.text;

  // Skip commands
  if (text.startsWith('/')) return;

  try {
    const response = await axios.post(GOOGLE_SHEET_URL, { action: 'getPartner', chatId });
    const { partnerId } = response.data;

    if (partnerId) {
      await ctx.telegram.sendMessage(partnerId, text);
    } else {
      await ctx.reply('No partner found. Type /search to find a new partner.');
    }
  } catch (error) {
    await ctx.reply('Error fetching partner. Please try again.');
  }
});

// Vercel production mode
exports.startVercel = async (req, res) => {
  await production(req, res, bot);
};

// Development mode
if (ENVIRONMENT !== 'production') {
  development(bot);
}
