import { Discord, Logger } from '@book000/node-utils'
import { MelonBooksCheckConfiguration } from './config'
import { MelonBooks } from './melon-books'
import fs from 'node:fs'

function getPreviousStock(itemId: string): string | null {
  const stockPath = process.env.STOCK_PATH ?? './data/stocks.json'
  if (!fs.existsSync(stockPath)) {
    return null
  }

  const stock: Record<string, string | undefined> = JSON.parse(
    fs.readFileSync(stockPath, 'utf8')
  )
  if (itemId in stock) {
    return stock[itemId] ?? null
  }

  return null
}

function setPreviousStock(itemId: string, stock: string): void {
  const stockPath = process.env.STOCK_PATH ?? './data/stock.json'
  if (!fs.existsSync(stockPath)) {
    fs.writeFileSync(stockPath, '{}')
  }

  const previousStock: Record<string, string | undefined> = JSON.parse(
    fs.readFileSync(stockPath, 'utf8')
  )
  previousStock[itemId] = stock
  fs.writeFileSync(stockPath, JSON.stringify(previousStock))
}

async function main() {
  const logger = Logger.configure('main')

  const config = new MelonBooksCheckConfiguration()
  config.load()
  if (!config.validate()) {
    logger.error('❌ Configuration is invalid')
    logger.error(
      `💡 Missing check(s): ${config.getValidateFailures().join(', ')}`
    )
    process.exitCode = 1
    return
  }

  const targets = config.get('targets')

  for (const target of targets) {
    logger.info(`👀 Checking ${target}...`)
    const book = new MelonBooks(target)
    await book.load()

    logger.info(`📖 ${book.title} - ${book.authorName}`)
    logger.info(book.toString())

    if (book.stock === undefined) {
      logger.error('📦 Stock is undefined')
      continue
    }

    const previousStock = getPreviousStock(target)
    if (previousStock === null) {
      logger.info('📦 First time checking this item')
      setPreviousStock(target, book.stock)
      continue
    }

    if (previousStock === book.stock) {
      logger.info('📦 Stock is unchanged')
      continue
    }

    logger.info('📦 Stock has changed!')
    setPreviousStock(target, book.stock)

    const discordWebhookUrl = config.get('discordWebhookUrl')

    const discord = new Discord({
      webhookUrl: discordWebhookUrl,
    })
    await discord.sendMessage({
      embeds: [
        {
          title: `\`${book.title}\` の在庫が変更されました`,
          description: `**${previousStock}** → **${book.stock}**`,
          url: `https://www.melonbooks.co.jp/detail/detail.php?product_id=${target}&adult_view=1`,
          fields: [
            {
              name: 'Author',
              value: book.authorName ? `\`${book.authorName}\`` : 'NULL',
            },
            {
              name: 'Price',
              value: book.price ? `\`${book.price.toString()}円\`` : 'NULL',
            },
            {
              name: 'Notes',
              value: book.notes ? `\`${book.notes.join('`, `')}\`` : 'NULL',
            },
          ],
          color: 0x00_ff_00,
        },
      ],
    })
  }

  logger.info('✅ Done!')
}

;(async () => {
  await main()
})()
