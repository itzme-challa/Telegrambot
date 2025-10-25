import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';

const debug = createDebug('bot:share_text');
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || '';

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const share = () => async (ctx: Context) => {
  debug('Triggered "share" command');

  const messageId = ctx.message?.message_id;
  const chatID = ctx.chat?.id.toString();
  const username = ctx.from?.username;

  if (messageId && chatID) {
    try {
      const { data } = await axios.post(GOOGLE_SHEET_API, {
        action: 'getPartnerID',
        chatID,
      });

      const partnerID = data.partnerID;
      if (partnerID) {
        const profileLink = username ? `https://t.me/${username}` : `User ID: ${chatID}`;
        await ctx.telegram.sendMessage(partnerID, `Your partner's profile: ${profileLink}`);
        await replyToMessage(ctx, messageId, 'Your profile has been shared with your partner.');
      } else {
        await replyToMessage(ctx, messageId, 'No partner assigned. Use /search to find a partner.');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      await replyToMessage(ctx, messageId, 'Error sharing profile. Try again later.');
    }
  }
};

export { share };
