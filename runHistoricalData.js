import { fetchHistorical } from "./fetchHistorical.js"
import { db } from "./database.js"
import { sleep, parseLine, getResumeEnd, rowToComparable } from "./helper.js"

export async function runHistoricalData(symbol, interval = 2000) {
  let end = await getResumeEnd(symbol)

  while (true) {
    console.log(`[${symbol}] fetching with end:`, end ?? "NONE")

    const data = await fetchHistorical(symbol, end)
    const lines =
      typeof data === "string" ? data.trim().split("\n") : data?.results

    if (!lines || lines.length === 0) {
      console.log("No new data")
      await sleep(interval)
      continue
    }

    const parsed = lines.map((line) => parseLine(line, symbol))

    await db.transaction(async (trx) => {
      for (const row of parsed) {
        await trx("historical")
          .insert(row)
          .onConflict(["symbol", "date", "time"])
          .ignore()
      }
    })

    // FIRST row → next end
    end = rowToComparable(parsed[0].datetime)

    console.log(`Inserted ${parsed.length} rows, next end=${end}`)

    await sleep(interval)
  }
}
