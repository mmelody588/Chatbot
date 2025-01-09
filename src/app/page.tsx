'use client';

import { useChat } from 'ai/react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Message from "@/app/components/Messages";

export default function Home() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat', // Ensure this matches the backend endpoint
    });

    return (
        <main className="fixed h-full w-full bg-muted">
            <div className="container h-full w-full flex flex-col py-8">
                <div className="flex-1 overflow-y-auto">
                    {messages.map((message, index) => (
                        <Message key={index} message={message} />
                    ))}
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
                    className="mt-auto relative"
                >
                    <Textarea
                        className="w-full text-lg"
                        placeholder="Say something..."
                        value={input}
                        onChange={handleInputChange}
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
