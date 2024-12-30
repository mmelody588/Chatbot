'use client'

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Message from "@/app/components/Messages";

export default function Home() {
    const [messages, setMessages] = useState([
        { role: "system", content: "You are a helpful assistant." }, // Initial system message
    ]);
    const [input, setInput] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!input.trim()) return;

        // Add the user message to the local state
        const newMessages = [
            ...messages,
            { role: "user", content: input },
        ];
        setMessages(newMessages);
        setInput("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                // Append the assistant's response to the messages array
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {role: "assistant", content: data.choices[0].message.content},
                ]);
            } else {
                console.error("Invalid API response");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <main className="fixed h-full w-full bg-muted">
            <div className="container h-full w-full flex flex-col py-8">
                <div className="flex-1 overflow-y-auto">
                    {messages.map((message, index) => (
                        <Message key={index} message={message} />
                    ))}
                </div>
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="mt-auto relative"
                >
                    <Textarea
                        className="w-full text-lg"
                        placeholder="Say something..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input}
                        className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full"
                    >
                        <Send size={24} />
                    </Button>
                </form>
            </div>
        </main>
    );
}
