import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';

const debug = createDebug('bot:search_text');
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || '';

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const search = () => async (ctx: Context) => {
  debug('Triggered "search" command');

  const messageId = ctx.message?.message_id;
  const chatID = ctx.chat?.id.toString();

  if (messageId && chatID) {
    try {
      // Check if user already has a partner
      const { data: partnerData } = await axios.post(GOOGLE_SHEET_API, {
        action: 'getPartnerID',
        chatID,
      });

      if (partnerData.partnerID) {
        await replyToMessage(ctx, messageId, `You already have a partner. Use /stop to end the current dialog.`);
        return;
      }

      await replyToMessage(ctx, messageId, 'Looking for a partner...');
      
      // Find available partners
      const { data: partners } = await axios.post(GOOGLE_SHEET_API, {
        action: 'findPartners',
        chatID,
      });

      if (partners.length === 0) {
        await replyToMessage(ctx, messageId, 'No partners found. Try again later.');
        return;
      }

      // Select random partner
      const partner = partners[Math.floor(Math.random() * partners.length)];
      const partnerChatID = partner[0];

      // Assign partner
      const { data: assignData } = await axios.post(GOOGLE_SHEET_API, {
        action: 'assignPartner',
        chatID,
        partnerChatID,
      });

      if (assignData.status === 'assigned') {
        const message = `Partner found 🐵\n/stop — stop this dialog\n/link — share your profile`;
        await ctx.telegram.sendMessage(chatID, message);
        await ctx.telegram.sendMessage(partnerChatID, message);
      } else {
        await replyToMessage(ctx, messageId, 'Error assigning partner. Try again later.');
      }
    } catch (error) {
      console.error('Error searching for partner:', error);
      await replyToMessage(ctx, messageId, 'Error searching for partner. Try again later.');
    }
  }
};

export { search };
