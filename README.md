# meronbooks-check

It monitors sale-state at [Melonbooks](https://www.melonbooks.co.jp) and notifies you if there are any changes.

## Configuration

File: `data/config.json`

- `discordWebhookUrl`: Discord Webhook URL to notify
- `targets`: Product ID in Melonbooks

```json
{
  "discordWebhookUrl": "https://discord.com/api/webhooks/...",
  "targets": [
    "1111111"
  ]
}
```
