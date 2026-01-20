import "dotenv/config"
import { runHistoricalData } from "./runHistoricalData.js"
import { runLatestData } from "./runLatestData.js"
import { shutdown } from "./helper.js"

const SYMBOL = process.env.SYMBOL || "SOFI"

process.on("SIGINT", async () => {
  console.log("\nSIGINT received. Shutting down gracefully...")
  await shutdown()
})

process.on("SIGTERM", async () => {
  console.log("\nSIGTERM received. Shutting down gracefully...")
  await shutdown()
})

runHistoricalData(SYMBOL, 2000).catch(console.error)

runLatestData(SYMBOL)
  .then(() => {
    console.log("Done")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

