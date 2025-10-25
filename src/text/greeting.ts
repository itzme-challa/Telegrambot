import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';

const debug = createDebug('bot:greeting_text');
const GOOGLE_SHEET_API = process.env.GOOGLE_SHEET_API || '';

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`;
  const chatID = ctx.chat?.id.toString();

  if (messageId && chatID) {
    // Save chat ID to Google Sheet
    try {
      const { data } = await axios.post(GOOGLE_SHEET_API, {
        action: 'saveChatID',
        chatID,
      });
      await replyToMessage(ctx, messageId, `Hello, ${userName}! Use /search to find a partner.`);
    } catch (error) {
      console.error('Error saving chat ID:', error);
      await replyToMessage(ctx, messageId, `Error saving your chat ID. Try again later.`);
    }
  }
};

export { greeting };
