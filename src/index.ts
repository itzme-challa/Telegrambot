import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { about } from './commands';
import { greeting, search, stop, link, share } from './text';
import axios from 'axios';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || ''; // Add to Vercel env variables

const bot = new Telegraf(BOT_TOKEN);

// Commands
bot.command('about', about());
bot.command('start', greeting());
bot.command('search', search());
bot.command('stop', stop());
bot.command('link', link());
bot.command('share', share());

// Forward messages to partner
bot.on('message', async (ctx) => {
  const chatID = ctx.chat.id.toString();
  const message = ctx.message;

  // Check if user has a partner
  const { data } = await axios.post(GOOGLE_SHEET_API, {
    action: 'getPartnerID',
    chatID,
  });

  const partnerID = data.partnerID;
  if (partnerID) {
    try {
      // Forward the message to the partner
      if ('text' in message) {
        await ctx.telegram.sendMessage(partnerID, message.text);
      } else if ('photo' in message) {
        await ctx.telegram.sendPhoto(partnerID, message.photo[message.photo.length - 1].file_id);
      } else if ('voice' in message) {
        await ctx.telegram.sendVoice(partnerID, message.voice.file_id);
      } else if ('video' in message) {
        await ctx.telegram.sendVideo(partnerID, message.video.file_id);
      } else {
        await ctx.reply('Unsupported message type.');
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
      await ctx.reply('Error sending message to partner.');
    }
  } else {
    await ctx.reply('No partner assigned. Use /search to find a partner.');
  }
});

// Vercel production mode
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// Development mode
if (ENVIRONMENT !== 'production') {
  development(bot);
}
