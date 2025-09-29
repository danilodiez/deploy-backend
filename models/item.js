import items from "../items.json" with { type: "json" };
const articles = items;

export class ItemModel {
  static async getAll() {
    return articles;
  }

  static async getByName({ name }) {
    const filteredArticle = articles.find(({ title }) => title === name)
    return filteredArticle;
  }

  static async create({ id,
    title, year, brand, price, poster, category, rate }) {
    articles.push({
      id,
      title, year, brand, price, poster, category, rate
    })
    return articles
  }

  static async update({ foundIndex, body }) {
    articles[foundIndex] = {
      ...articles[foundIndex],
      ...body
    }
  }
  // TODO
  static async delete() {

  }
}
