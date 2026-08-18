import axios from "axios";
import { z } from "zod";

const PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Google PageSpeed Insights API doesn't require an API key for basic usage,
// but has rate limits. For production, you should get a free API key from Google Cloud Console.
// Add it as an environment variable: GOOGLE_PAGESPEED_API_KEY

export interface PageSpeedResult {
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  issues: Array<{
    title: string;
    description: string;
    severity: "critical" | "warning" | "info";
  }>;
  recommendations: string[];
  loadTime: number;
  mobileScore: number;
}

export async function analyzeWebsite(url: string): Promise<PageSpeedResult> {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    
    // Build params with optional API key
    const params: Record<string, any> = {
      url: url,
      strategy: "mobile",
      category: ["performance", "seo", "accessibility", "best-practices"],
    };

    // Add API key if available (enables 25,000 requests/day instead of ~25/day)
    if (process.env.GOOGLE_PAGESPEED_API_KEY) {
      params.key = process.env.GOOGLE_PAGESPEED_API_KEY;
      console.log('[PageSpeed] Using API key:', process.env.GOOGLE_PAGESPEED_API_KEY.substring(0, 10) + '...');
    } else {
      console.log('[PageSpeed] No API key found - using free tier');
    }

    // Call PageSpeed Insights API for mobile
    // PageSpeed API can take 30-60 seconds for complex sites
    const mobileResponse = await axios.get(PAGESPEED_API_URL, {
      params,
      timeout: 60000, // 60 second timeout
    });

    const mobileData = mobileResponse.data;
    const lighthouseResult = mobileData.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    // Extract scores (0-100)
    const performance = Math.round((categories.performance?.score ?? 0) * 100);
    const seo = Math.round((categories.seo?.score ?? 0) * 100);
    const accessibility = Math.round((categories.accessibility?.score ?? 0) * 100);
    const bestPractices = Math.round((categories["best-practices"]?.score ?? 0) * 100);

    // Extract key issues
    const issues: PageSpeedResult["issues"] = [];
    
    // Performance issues
    if (audits["largest-contentful-paint"]?.score !== null && audits["largest-contentful-paint"].score < 0.5) {
      issues.push({
        title: "Slow Largest Contentful Paint",
        description: `LCP is ${audits["largest-contentful-paint"].displayValue}. Optimize images and server response time.`,
        severity: "critical",
      });
    }

    if (audits["total-blocking-time"]?.score !== null && audits["total-blocking-time"].score < 0.5) {
      issues.push({
        title: "High Total Blocking Time",
        description: `TBT is ${audits["total-blocking-time"].displayValue}. Reduce JavaScript execution time.`,
        severity: "warning",
      });
    }

    if (audits["cumulative-layout-shift"]?.score !== null && audits["cumulative-layout-shift"].score < 0.75) {
      issues.push({
        title: "Layout Shift Issues",
        description: `CLS is ${audits["cumulative-layout-shift"].displayValue}. Add size attributes to images and reserve space for dynamic content.`,
        severity: "warning",
      });
    }

    // SEO issues
    if (audits["meta-description"]?.score === 0) {
      issues.push({
        title: "Missing Meta Description",
        description: "Add meta descriptions to improve search engine visibility.",
        severity: "warning",
      });
    }

    if (audits["document-title"]?.score === 0) {
      issues.push({
        title: "Missing or Poor Title Tag",
        description: "Every page needs a unique, descriptive title tag.",
        severity: "critical",
      });
    }

    // Accessibility issues
    if (audits["color-contrast"]?.score === 0) {
      issues.push({
        title: "Poor Color Contrast",
        description: "Text doesn't have sufficient contrast with background colors.",
        severity: "warning",
      });
    }

    if (audits["image-alt"]?.score === 0) {
      issues.push({
        title: "Missing Image Alt Text",
        description: "All images should have descriptive alt attributes for accessibility.",
        severity: "warning",
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (performance < 50) {
      recommendations.push("Optimize images and enable compression");
      recommendations.push("Minimize JavaScript and CSS");
      recommendations.push("Use a Content Delivery Network (CDN)");
    } else if (performance < 90) {
      recommendations.push("Enable browser caching");
      recommendations.push("Optimize server response time");
    }

    if (seo < 90) {
      recommendations.push("Add meta descriptions to all pages");
      recommendations.push("Ensure all pages have unique title tags");
      recommendations.push("Create an XML sitemap");
    }

    if (accessibility < 90) {
      recommendations.push("Add alt text to all images");
      recommendations.push("Improve color contrast ratios");
      recommendations.push("Ensure keyboard navigation works properly");
    }

    if (recommendations.length === 0) {
      recommendations.push("Great job! Your site scores well across all metrics.");
      recommendations.push("Consider adding structured data for enhanced search results");
    }

    // Extract load time metrics
    const loadTime = audits["interactive"]?.numericValue 
      ? Math.round(audits["interactive"].numericValue / 1000) 
      : 0;

    return {
      url,
      performance,
      seo,
      accessibility,
      bestPractices,
      issues: issues.slice(0, 5), // Limit to top 5 issues
      recommendations: recommendations.slice(0, 5), // Limit to top 5 recommendations
      loadTime,
      mobileScore: Math.round((performance + seo + accessibility + bestPractices) / 4),
    };
  } catch (error) {
    console.error("PageSpeed API Error:", error);
    
    if (axios.isAxiosError(error)) {
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error("Analysis timed out. The website took too long to analyze. Please try again.");
      }
      
      // Handle rate limit
      if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      }
      
      // Handle invalid URL
      if (error.response?.status === 400) {
        throw new Error("Invalid URL provided. Please check the URL and try again.");
      }
      
      // Handle API key errors
      if (error.response?.status === 403) {
        throw new Error("API key error. Please contact support.");
      }
    }
    
    throw new Error("Failed to analyze website. Please try again later.");
  }
}
