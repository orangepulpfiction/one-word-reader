import { NextRequest, NextResponse } from "next/server";
import { parseArticle } from "@/lib/parser";

export async function POST(request: NextRequest) {
    try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
        return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
        );
    }

    try {
        new URL(url);
    } catch {
        return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
        );
    }

    const result = await parseArticle(url);
    return NextResponse.json(result);
    } catch (err) {
    const message =
        err instanceof Error ? err.message : "Failed to parse article";
    return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
const url = request.nextUrl.searchParams.get("url");

if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
}

try {
    const result = await parseArticle(url);
    return NextResponse.json(result);
} catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse article";
    return NextResponse.json({ error: message }, { status: 500 });
}
}
