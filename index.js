require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GIF_URL =
  process.env.GIF_URL ||
  'https://static.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/30/96/Fu0UzaEL9PSVo9fD.mp4';
// GIFと一緒に投稿するテキスト(.envのALERT_TEXTで変更可。\nで改行)
const ALERT_TEXT = (
  process.env.ALERT_TEXT ||
  '🚨🚨🚨 下ネタを検知しました 🚨🚨🚨'
).replace(/\\n/g, ' ');
// カンマ区切りで複数指定可。大文字小文字は区別しません。
const TRIGGERS = (process.env.TRIGGERS || 'alarm')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
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
  if (!TRIGGERS.some((t) => text.includes(t))) return;

  const now = Date.now();
  if (now - (lastSent.get(message.channelId) || 0) < COOLDOWN_MS) return;
  lastSent.set(message.channelId, now);

  try {
    // 文章自体をリンクにして、URLの文字列を見せない(動画プレビューは出る)
    await message.channel.send(`[${ALERT_TEXT}](${GIF_URL})`);
  } catch (err) {
    console.error('送信に失敗しました:', err.message);
  }
});

client.login(TOKEN);
