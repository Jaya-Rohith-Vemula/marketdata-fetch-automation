import "dotenv/config"
import { chromium } from "playwright"

class AuthManager {
  constructor() {
    this.cookie = null
    this.xsrfToken = null
    this.usageCount = 0
    this.maxUsage = 15
    this.refreshing = null
  }

  async refresh() {
    // Prevent parallel refreshes
    if (this.refreshing) {
      return this.refreshing
    }

    this.refreshing = (async () => {
      const browser = await chromium.launch({ headless: true })

      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      })

      const page = await context.newPage()

      let xsrfToken = null

      page.on("request", (req) => {
        if (req.url().includes("/proxies/") && req.headers()["x-xsrf-token"]) {
          xsrfToken = req.headers()["x-xsrf-token"]
        }
      })

      const symbol = process.env.SYMBOL || "SOFI"
      await page.goto(
        `${process.env.DOMAIN}/stocks/quotes/${symbol}/interactive-chart`,
        { waitUntil: "domcontentloaded" },
      )


      await page.waitForTimeout(4000)

      const cookies = await context.cookies()
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ")

      await browser.close()

      if (!xsrfToken) {
        throw new Error("Failed to capture x-xsrf-token")
      }

      this.cookie = cookieHeader
      this.xsrfToken = xsrfToken
      this.usageCount = 0

      this.refreshing = null
    })()

    return this.refreshing
  }

  async getAuthHeaders() {
    if (!this.cookie || !this.xsrfToken || this.usageCount >= this.maxUsage) {
      console.log("Refreshing auth tokens because...", {
        noCookie: !this.cookie,
        noXsrf: !this.xsrfToken,
        usageCount: this.usageCount,
        maxUsage: this.maxUsage,
      })
      await this.refresh()
    }

    this.usageCount++

    console.log(`Using auth tokens (usage count: ${this.usageCount})`)
    return {
      cookie: this.cookie,
      "x-xsrf-token": this.xsrfToken,
    }
  }

  invalidate() {
    console.log("Invalidating auth tokens...")
    this.cookie = null
    this.xsrfToken = null
    this.usageCount = this.maxUsage
  }
}

export const authManager = new AuthManager()
