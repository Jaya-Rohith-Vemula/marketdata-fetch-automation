import { db } from "./database.js"

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let shutdownInProgress = false

export async function shutdown() {
  if (shutdownInProgress) return
  shutdownInProgress = true

  try {
    console.log("Closing database...")
    await db.destroy()
    console.log("Database closed.")
  } catch (err) {
    console.error("Shutdown error:", err.message)
  } finally {
    process.exit(0)
  }
}

export function parseLine(line, symbol) {
  const [datetime, , open, high, low, close, volume] = line.split(",")
  const [date, time] = datetime.split(" ")

  return {
    symbol,
    date,
    time,
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
    datetime,
  }
}

export function rowToComparable(row) {
  return (row.date + row.time).replace(/[-:]/g, "") + "00"
}

export async function getResumeEnd(symbol) {
  const row = await db("historical")
    .where({ symbol })
    .orderBy("date", "asc")
    .orderBy("time", "asc")
    .first()

  return row ? rowToComparable(row) : null
}

export async function getLatestEnd(symbol) {
  const row = await db("historical")
    .where({ symbol })
    .orderBy("date", "desc")
    .orderBy("time", "desc")
    .first()

  return row ? rowToComparable(row) : null
}
