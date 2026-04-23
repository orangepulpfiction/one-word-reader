"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface ArticleData {
    title: string;
    words: string[];
    wordCount: number;
}

export default function ReaderPage() {
    const router = useRouter();
    const [data, setData] = useState<ArticleData | null>(null);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [wpm, setWpm] = useState(250);
    const [controlsVisible, setControlsVisible] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
    const stored = sessionStorage.getItem("rsvp-data");
    if (!stored) {
        router.push("/");
        return;
    }
    setData(JSON.parse(stored));
    }, [router]);

    const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
        if (playing) setControlsVisible(false);
    }, 3000);
    }, [playing]);

    useEffect(() => {
    if (playing) {
        showControls();
    } else {
        setControlsVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    }, [playing, showControls]);

    useEffect(() => {
    if (playing && data) {
        const ms = 60000 / wpm;
        intervalRef.current = setInterval(() => {
        setIndex((prev) => {
            if (prev >= data.wordCount - 1) {
            setPlaying(false);
            return prev;
            }
            return prev + 1;
        });
        }, ms);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
    }, [playing, wpm, data]);

    const findSentenceBoundary = useCallback(
    (fromIndex: number, direction: 1 | -1): number => {
        if (!data) return fromIndex;
        let i = fromIndex;
        while (i >= 0 && i < data.wordCount) {
        i += direction;
        if (i < 0) return 0;
        if (i >= data.wordCount) return data.wordCount - 1;
        if (i > 0 && /[.!?]$/.test(data.words[i - 1])) {
            if (
            (direction === 1 && i > fromIndex) ||
            (direction === -1 && i < fromIndex)
            ) {
            return i;
            }
        }
        }
        return direction === 1 ? data.wordCount - 1 : 0;
    },
    [data]
    );

    useEffect(() => {
    function handleKey(e: KeyboardEvent) {
        if (!data) return;
        if (e.target instanceof HTMLInputElement) return;

        switch (e.code) {
        case "Space":
            e.preventDefault();
            setPlaying((p) => !p);
            break;
        case "ArrowRight":
            e.preventDefault();
            if (e.shiftKey) {
            setIndex((prev) => findSentenceBoundary(prev, 1));
            } else {
            setIndex((prev) => Math.min(prev + 1, data.wordCount - 1));
            }
            showControls();
            break;
        case "ArrowLeft":
            e.preventDefault();
            if (e.shiftKey) {
            setIndex((prev) => findSentenceBoundary(prev, -1));
            } else {
            setIndex((prev) => Math.max(prev - 1, 0));
            }
            showControls();
            break;
        case "Equal":
        case "NumpadAdd":
            setWpm((w) => Math.min(w + 25, 800));
            showControls();
            break;
        case "Minus":
        case "NumpadSubtract":
            setWpm((w) => Math.max(w - 25, 100));
            showControls();
            break;
        case "KeyR":
            setIndex(0);
            setPlaying(false);
            showControls();
            break;
        case "Escape":
            router.push("/");
            break;
        }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    }, [data, router, findSentenceBoundary, showControls]);

    if (!data) {
    return (
        <main className="loading">
        <p>Loading...</p>
        </main>
    );
    }

    const progress =
    data.wordCount > 1 ? (index / (data.wordCount - 1)) * 100 : 0;
    const currentWord = data.words[index] || "";

    return (
    <main
        className="reader"
        onMouseMove={showControls}
        onClick={() => setPlaying((p) => !p)}
    >
        <div
        className="reader-title"
        style={{ opacity: controlsVisible ? 1 : 0 }}
        >
        <p>{data.title}</p>
        </div>

        <div className="word-container">
        <span className="word">{currentWord}</span>
        </div>

        <div
        className="controls-wrapper"
        style={{ opacity: controlsVisible ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
        >
        <div className="progress-bar">
            <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
            />
        </div>

        <div className="controls">
            <div className="controls-group">
            <button
                className="ctrl-btn"
                onClick={() =>
                setIndex((prev) => findSentenceBoundary(prev, -1))
                }
                title="Previous sentence (Shift+←)"
            >
                ⟪
            </button>
            <button
                className="ctrl-btn"
                onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                title="Previous word (←)"
            >
                ◂
            </button>
            <button
                className="play-btn"
                onClick={() => setPlaying((p) => !p)}
                title="Play/Pause (Space)"
            >
                {playing ? "❚❚" : "▸"}
            </button>
            <button
                className="ctrl-btn"
                onClick={() =>
                setIndex((prev) => Math.min(prev + 1, data.wordCount - 1))
                }
                title="Next word (→)"
            >
                ▸
            </button>
            <button
                className="ctrl-btn"
                onClick={() =>
                setIndex((prev) => findSentenceBoundary(prev, 1))
                }
                title="Next sentence (Shift+→)"
            >
                ⟫
            </button>
            </div>

            <div className="controls-group">
            <button
                className="ctrl-btn"
                onClick={() => setWpm((w) => Math.max(w - 25, 100))}
                title="Slower (−)"
            >
                −
            </button>
            <span className="speed-display">{wpm} wpm</span>
            <button
                className="ctrl-btn"
                onClick={() => setWpm((w) => Math.min(w + 25, 800))}
                title="Faster (+)"
            >
                +
            </button>
            </div>

            <div className="controls-group">
            <span className="position">
                {index + 1} / {data.wordCount.toLocaleString()}
            </span>
            <button
                className="ctrl-btn"
                onClick={() => {
                setIndex(0);
                setPlaying(false);
                }}
                title="Restart (R)"
            >
                ↺
            </button>
            <button
                className="ctrl-btn"
                onClick={() => router.push("/")}
                title="Back (Esc)"
            >
                ✕
            </button>
            </div>
        </div>
        </div>
    </main>
    );
}
