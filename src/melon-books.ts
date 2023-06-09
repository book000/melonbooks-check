import axios from 'axios'
import { load } from 'cheerio'

export class MelonBooks {
  public readonly itemId: string

  private _title?: string
  private _notes?: string[]
  private _authorName?: string
  private _price?: number
  private _stock?: string

  constructor(itemId: string) {
    this.itemId = itemId
  }

  public async load(): Promise<void> {
    const response = await axios.get(
      `https://www.melonbooks.co.jp/detail/detail.php?product_id=${this.itemId}&adult_view=1`
    )
    const html = response.data
    const $ = load(html)

    this._title = $('h1.page-header').text().trim()
    const notes = $('div.item-header span.item-notes')
    this._notes = []
    for (const note of notes) {
      const text = $(note).text().trim()
      if (text.length === 0) {
        continue
      }
      this._notes.push(text)
    }

    this._authorName = $('div.item-header p.author-name').text().trim()

    this._price = Number.parseInt(
      $('div.item-body-wrap p.price span.yen')
        .text()
        .replace('¥', '')
        .replace(',', '')
        .trim()
    )

    this._stock = $('span.state-instock').text().trim()
  }

  public get title(): string | undefined {
    return this._title
  }

  public get notes(): string[] | undefined {
    return this._notes
  }

  public get authorName(): string | undefined {
    return this._authorName
  }

  public get price(): number | undefined {
    return this._price
  }

  public get stock(): string | undefined {
    return this._stock
  }

  toString(): string {
    return `MelonBooks { itemId: ${this.itemId}; title: ${this._title}; notes: ${this._notes}; authorName: ${this._authorName}; price: ${this._price}; stock: ${this._stock} }`
  }
}
