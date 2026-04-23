import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function parseArticle(url: string) {
    const response = await fetch(url, {
    headers: {
        "User-Agent":
        "Mozilla/5.0 (compatible; RSVPReader/1.0; +https://rsvp-reader.vercel.app)",
    },
    });

    if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
    throw new Error("Could not extract article content from this URL");
    }

    const articleHtml = article.content || "";
    const textDom = new JSDOM(articleHtml);
    textDom.window.document.querySelectorAll("p, br, div, h1, h2, h3, h4, h5, h6, li, blockquote, tr").forEach((el) => {
    el.insertAdjacentText("afterend", " ");
    });
    const text = (textDom.window.document.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

    const words = text.split(" ").filter((w) => w.length > 0);

    return {
    title: article.title || "Untitled",
    words,
    wordCount: words.length,
    };
}
