# alarmdogbot

指定した文字列を含むメッセージを検出すると、GIFを投稿するDiscordボットです。

## セットアップ
1. https://discord.com/developers/applications で「New Application」→ Bot を作成し、トークンをコピー
2. Bot ページの **Privileged Gateway Intents** で **MESSAGE CONTENT INTENT** をON
3. OAuth2 → URL Generator で scope `bot`、権限 `View Channels` `Send Messages` `Embed Links` を選び、生成URLでサーバーに招待
4. このフォルダで:
   ```
   npm install
   cp .env.example .env   # トークンとTRIGGERSを編集
   npm start
   ```

## 設定(.env)
- `TRIGGERS` … 反応する文字列(カンマ区切り)
- `GIF_URL` … 投稿するURL
- `COOLDOWN_SECONDS` … 同一チャンネルでの連投防止間隔
