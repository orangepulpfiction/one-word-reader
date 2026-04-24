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
$("p, br, div, h1, h2, h3, h4, h5, h6, li, blockquote, tr").each((_, el) => {
    $(el).append(" ");
});
const text = $.text().replace(/\s+/g, " ").trim();
const words = text.split(" ").filter((w) => w.length > 0);

return {
    title: article.title || "Untitled",
    words,
    wordCount: words.length,
};
}
