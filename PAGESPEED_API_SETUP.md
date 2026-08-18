# Google PageSpeed Insights API Setup

The FlowSites website analyzer uses the Google PageSpeed Insights API to provide real-time website performance analysis. Without an API key, the service is subject to Google's free tier rate limits (approximately 25 requests per day).

## Why You Need an API Key

- **Free tier rate limit:** ~25 requests/day without API key
- **With API key:** 25,000 requests/day (free)
- **Better for production:** Avoid "Rate limit exceeded" errors for your visitors

## How to Get a Free API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Enter project name (e.g., "FlowSites Analyzer")
5. Click "Create"

### Step 2: Enable PageSpeed Insights API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "PageSpeed Insights API"
3. Click on it, then click **Enable**

### Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the generated API key
4. (Optional but recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Choose "PageSpeed Insights API" from the dropdown
   - Click "Save"

### Step 4: Add API Key to Your Project

#### Option A: Using Manus Management UI (Recommended)

1. Open your FlowSites project in Manus
2. Click the **Settings** icon in the Management UI
3. Go to **Secrets** tab
4. Add a new secret:
   - **Key:** `GOOGLE_PAGESPEED_API_KEY`
   - **Value:** Paste your API key
   - **Description:** Google PageSpeed Insights API key for website analyzer
5. Save and restart the dev server

#### Option B: Using Environment Variables (Local Development)

Create a `.env` file in the project root:

```bash
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

**Important:** Never commit `.env` files to Git. The `.gitignore` file already excludes them.

## Verifying the Setup

1. Restart your dev server
2. Go to `/analyzer` page
3. Enter any website URL and click "Analyze Website"
4. You should see real analysis results without rate limit errors

## Cost

The PageSpeed Insights API is **completely free** for up to 25,000 requests per day. This is more than enough for most production websites.

## Troubleshooting

### "Rate limit exceeded" error persists

- **Solution 1:** Wait 24 hours for the free tier quota to reset
- **Solution 2:** Verify your API key is correctly added to environment variables
- **Solution 3:** Check that the PageSpeed Insights API is enabled in Google Cloud Console

### "Invalid API key" error

- Verify you copied the entire API key without extra spaces
- Check that you've enabled the PageSpeed Insights API in Google Cloud Console
- Make sure the API key restrictions (if any) include the PageSpeed Insights API

### Still having issues?

Contact FlowSites support or check the [Google PageSpeed Insights API documentation](https://developers.google.com/speed/docs/insights/v5/get-started).
