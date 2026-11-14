require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GIF_URL =
  process.env.GIF_URL ||
  'https://static.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/30/96/Fu0UzaEL9PSVo9fD.mp4';
// GIFと一緒に投稿するテキスト(.envのALERT_TEXTで変更可。\nで改行)
const ALERT_TEXT = (
  process.env.ALERT_TEXT ||
  ':rotating_light: :rotating_light: :rotating_light: 下ネタを検知しました:rotating_light: :rotating_light: :rotating_light:'
).replace(/\\n/g, '\n');
// カンマ区切りで複数指定可。大文字小文字は区別しません。
const TRIGGERS = (process.env.TRIGGERS || 'alarm')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
// 特定の語には、別のGIFだけを返す(上から順に判定。先に当たったものが優先)
const SPECIAL_RULES = [
  {
    words: ['ちんちん', 'チンチン'], // 「おちんちん」も含まれるので反応する
    url: 'https://cultofthepartyparrot.com/parrots/hd/ultrafastparrot.gif',
    name: 'ultrafastparrot.gif',
  },
];
// SHOW_MATCH=true にすると、検知した語もスポイラー(||語||)で表示する
const SHOW_MATCH = process.env.SHOW_MATCH === 'true';
// 連投防止(同じチャンネルで何秒空けるか)
const COOLDOWN_MS = Number(process.env.COOLDOWN_SECONDS || 10) * 1000;

if (!TOKEN) {
  console.error('DISCORD_TOKEN が設定されていません (.env を確認してください)');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Developer Portal 側でも有効化が必要
  ],
});

const lastSent = new Map(); // channelId -> timestamp

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag} / triggers: ${TRIGGERS.join(', ')}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const text = message.content.toLowerCase();
  const special = SPECIAL_RULES.find((r) =>
    r.words.some((w) => text.includes(w.toLowerCase()))
  );
  const matched = TRIGGERS.find((t) => text.includes(t));
  if (!special && !matched) return;

  const now = Date.now();
  if (now - (lastSent.get(message.channelId) || 0) < COOLDOWN_MS) return;
  lastSent.set(message.channelId, now);

  try {
    if (special) {
      // 特定の語: 専用のGIFだけを、検知したメッセージへの返信として送る
      await message.reply({
        files: [{ attachment: special.url, name: special.name }],
        allowedMentions: { repliedUser: false },
      });
      return;
    }
    // 検知したメッセージへの返信として、動画を添付で送る(URLは表示されない)
    await message.reply({
      content: SHOW_MATCH ? `${ALERT_TEXT}\n検知した語: ||${matched}||` : ALERT_TEXT,
      files: [{ attachment: GIF_URL, name: 'alarmdog.mp4' }],
    });
  } catch (err) {
    console.error('送信に失敗しました:', err.message);
  }
});

client.login(TOKEN);
