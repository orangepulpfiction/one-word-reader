import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "One Word Reader",
    description: "Read articles one word at a time",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
    <html lang="en">
        <head>
        <link
            href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&display=swap"
            rel="stylesheet"
        />
        </head>
        <body>{children}</body>
    </html>
    );
}
