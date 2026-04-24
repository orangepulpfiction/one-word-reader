  import { Readability } from "@mozilla/readability";
  import { parseHTML } from "linkedom";
  import * as cheerio from "cheerio";

  export async function parseArticle(url: string) {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OneWordReader/1.0; +https://onewordread.vercel.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const html = await response.text();
    const { document } = parseHTML(html);

    const base = document.createElement("base");
    base.setAttribute("href", url);
    document.head.appendChild(base);

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.content) {
      throw new Error("Could not extract article content from this URL");
    }

    const $ = cheerio.load(article.content);

    // Remove non-body elements that Readability sometimes keeps
    $("figcaption, figure img, aside, [class*='byline'], [class*='author'], [class*='date'], [class*='meta'], [class*='caption'], [class*='credit']").remove();

    // Only extract text from body-content elements
    const bodyTags = "p, li, blockquote, h2, h3, h4, h5, h6";
    const chunks: string[] = [];
    $(bodyTags).each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 0) {
        chunks.push(text);
      }
    });

    const text = chunks.join(" ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter((w) => w.length > 0);

    if (words.length === 0) {
      throw new Error("Could not extract article content from this URL");
    }

    return {
      title: article.title || "Untitled",
      words,
      wordCount: words.length,
    };
  }
