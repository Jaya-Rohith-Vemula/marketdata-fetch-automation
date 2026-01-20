import knex from "knex"

export const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./db/stockdata.db",
  },
  useNullAsDefault: true,
})

await db.schema.hasTable("historical").then(async (exists) => {
  if (!exists) {
    await db.schema.createTable("historical", (table) => {
      table.string("symbol") // e.g. "SOFI"
      table.string("date") // YYYY-MM-DD
      table.string("time") // HH:MM
      table.float("open")
      table.float("high")
      table.float("low")
      table.float("close")
      table.bigInteger("volume")
      table.string("datetime")

      table.primary(["symbol", "date", "time"])
      table.index(["symbol", "date", "time"])
    })

    console.log("Table 'historical data' created.")
  }
})
