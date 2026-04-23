"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || "Failed to parse article");
        return;
        }

        sessionStorage.setItem("rsvp-data", JSON.stringify(data));
        router.push("/reader");
    } catch {
        setError("Something went wrong. Check the URL and try again.");
    } finally {
        setLoading(false);
    }
    }

    return (
    <main className="home">
        <div className="home-inner">
        <h1>One Word Reader</h1>
        <p className="subtitle">Read articles one word at a time</p>

        <form onSubmit={handleSubmit}>
            <input
            type="url"
            placeholder="Paste an article URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            autoFocus
            />
            <button type="submit" disabled={loading}>
            {loading ? "Parsing..." : "Read"}
            </button>
        </form>

        {error && <p className="error">{error}</p>}
        </div>
    </main>
    );
}
