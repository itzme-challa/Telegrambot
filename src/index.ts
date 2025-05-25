import { Telegraf } from 'telegraf';
import { about } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { handleCashfreeWebhook } from './cashfree'; // NEW: webhook logic
import { buyMaterial } from './commands/buy'; // NEW: bot command logic

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// Bot Commands
bot.command('about', about());
bot.command('buy', buyMaterial()); // NEW: /buy command
bot.on('message', greeting());

// Vercel webhook handler
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  const url = req.url || '';

  // Route to Cashfree webhook
  if (url.startsWith('/cashfree')) {
    await handleCashfreeWebhook(req, res);
    return;
  }

  // Fallback to bot webhook
  await production(req, res, bot);
};

// Local Dev Mode
ENVIRONMENT !== 'production' && development(bot);
