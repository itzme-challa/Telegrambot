import { Context } from 'telegraf';
import createDebug from 'debug';
import packageJson from '../../package.json'; // Causing the error

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  debug('Triggered "about" command');
  const messageId = ctx.message?.message_id;
  const reply = `This is a Telegram bot to connect users randomly. Version: ${packageJson.version}\nUse /search to find a partner, /stop to end a dialog, /link to request a profile, and /share to share your profile.`;

  if (messageId) {
    await ctx.reply(reply, {
      reply_parameters: { message_id: messageId },
    });
  }
};

export { about };
