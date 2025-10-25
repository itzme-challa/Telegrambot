import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';

const debug = createDebug('bot:link_text');
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || '';

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const link = () => async (ctx: Context) => {
  debug('Triggered "link" command');

  const messageId = ctx.message?.message_id;
  const chatID = ctx.chat?.id.toString();

  if (messageId && chatID) {
    try {
      const { data } = await axios.post(GOOGLE_SHEET_API, {
        action: 'getPartnerID',
        chatID,
      });

      const partnerID = data.partnerID;
      if (partnerID) {
        await ctx.telegram.sendMessage(partnerID, 'Your partner wants to share profiles. Use /share to send your profile link.');
        await replyToMessage(ctx, messageId, 'Requested your partner to share their profile.');
      } else {
        await replyToMessage(ctx, messageId, 'No partner assigned. Use /search to find a partner.');
      }
    } catch (error) {
      console.error('Error requesting link:', error);
      await replyToMessage(ctx, messageId, 'Error requesting profile link. Try again later.');
    }
  }
};

export { link };
