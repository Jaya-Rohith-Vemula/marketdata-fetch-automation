# Market Data Fetch Automation

An automated tool designed to fetch and store historical minute-by-minute market data. It uses browser automation to handle authentication and session maintenance, ensuring a robust data pipeline into a local SQLite database.

## Features

- **Automated Authentication**: Uses Playwright to headlessly log in and capture session cookies and XSRF tokens.
- **Smart Data Fetching**:
  - `runLatestData`: Fetches the most recent data and paginates backward until it matches existing database records.
  - `runHistoricalData`: Continually fetches older data to fill out historical gaps.
- **SQLite Storage**: Efficiently stores OHLCV data using Knex.js.
- **Graceful Shutdown**: Handles `SIGINT` and `SIGTERM` to safely close database connections.
- **Auto-pagination**: Automatically handles paginated API responses (up to 5000 records per request).

## Tech Stack

- **Node.js**: Runtime environment.
- **Playwright**: Browser automation for authentication.
- **Axios**: HTTP client for API requests.
- **Knex.js**: SQL query builder.
- **SQLite3**: Local database storage.
- **Dotenv**: Environment variable management.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd marketdata-fetch-automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright Browsers**:
   ```bash
   npx playwright install chromium
   ```
4. **Configuration**:
   Create a `.env` file in the root directory:
   ```env
   DOMAIN=domain name
   SYMBOL=symbol
   ```


## Usage

To start the data collection process:

```bash
node index.js
```

By default, the script tracks the ticker specified in the `SYMBOL` environment variable.

```bash
# To track a different symbol temporarily
SYMBOL=AAPL node index.js
```

### Script Modes

- **runLatestData(symbol)**: Use this to bring your database up to date with the most recent market activity.
- **runHistoricalData(symbol, interval)**: Use this to perform a deep fetch of historical data at a set interval (default 2000ms) to avoid rate limiting.

## Database Schema

The data is stored in `./db/stockdata.db` in a table named `historical`:

| Column | Type | Description |
| :--- | :--- | :--- |
| `symbol` | String | Ticker symbol (e.g., SOFI) |
| `date` | String | YYYY-MM-DD |
| `time` | String | HH:MM |
| `open` | Float | Opening price |
| `high` | Float | High price |
| `low` | Float | Low price |
| `close` | Float | Closing price |
| `volume` | BigInt | Trading volume |
| `datetime` | String | ISO formatted timestamp |

The primary key is a composite of `(symbol, date, time)`.

## Project Structure

- `index.js`: Main entry point.
- `authManager.js`: Handles session refreshing and token management.
- `fetchHistorical.js`: Core logic for API requests.
- `runHistoricalData.js`: Logic for deep historical fetching.
- `runLatestData.js`: Logic for catching up to real-time data.
- `database.js`: Knex configuration and schema initialization.
- `helper.js`: Utility functions for parsing and time manipulation.

