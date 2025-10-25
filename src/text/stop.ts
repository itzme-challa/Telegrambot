import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';

const debug = createDebug('bot:stop_text');
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || '';

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const stop = () => async (ctx: Context) => {
  debug('Triggered "stop" command');

  const messageId = ctx.message?.message_id;
  const chatID = ctx.chat?.id.toString();

  if (messageId && chatID) {
    try {
      const { data } = await axios.post(GOOGLE_SHEET_API, {
        action: 'removePartner',
        chatID,
      });

      const message = `You stopped the dialog 🙄\nType /search to find a new partner\n\nTo report partner: @itzfewbot`;

      if (data.status === 'removed' && data.partnerID) {
        await ctx.telegram.sendMessage(data.partnerID, `Your partner has stopped the dialog 😞\nType /search to find a new partner\n\nTo report partner: @itzfewbot`);
        await replyToMessage(ctx, messageId, message);
      } else if (data.status === 'not_found') {
        await replyToMessage(ctx, messageId, `You don't have an active dialog.\nType /search to find a partner.`);
      } else {
        await replyToMessage(ctx, messageId, message);
      }
    } catch (error) {
      console.error('Error stopping dialog:', error);
      await replyToMessage(ctx, messageId, 'Error stopping dialog. Try again later.');
    }
  }
};

export { stop };
