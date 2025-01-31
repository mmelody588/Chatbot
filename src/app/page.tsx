'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/app/lib/supabase";
import { Send } from "lucide-react";
import Message from "@/app/components/Messages";
import { Session } from "@supabase/auth-js";

export default function Home() {
    // All hooks should be at the top level
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<{ user_id: string; role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null); // Always declare hooks unconditionally

    // Authentication check
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                setIsLoading(false);
                return;
            }

            if (!session) {
                router.push("/login");
            } else {
                setSession(session);
            }

            setIsLoading(false);
        };

        checkSession();
    }, [router]);

    // Fetch messages
    useEffect(() => {
        if (!session) {
            return;
        }
        const fetchMessages = async () => {

            //console.log("Fetching messages with session:", session);

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error.message);
            } else {
                //console.log("Fetched messages:", data);
                setMessages(data || []);
            }
        };

        fetchMessages();
    }, [session]);

    // Loading state
    if (isLoading) {
        return <p>Loading...</p>;
    }

    // Redirect state
    if (!session) {
        return null; // Ensures nothing renders while redirecting
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!input.trim()) return;

        const newMessage = {
            user_id: session.user.id,
            role: "user",
            content: input.trim(),
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");

        try {
            const { error: insertError } = await supabase.from("messages").insert(newMessage);
            if (insertError) {
                console.error("Error inserting user message:", insertError.message);
                return;
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if(!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            const assistantMessage = {
                user_id: session.user.id,
                role: "assistant",
                content: data.choices[0]?.message?.content || "I'm sorry, I don't understand...",
            };

            const { error: responseError } = await supabase.from("messages").insert(assistantMessage);
            if (responseError) {
                console.error("Error inserting assistant message:", responseError.message);
                return;
            }

            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error("Error sending messages:", error);
        }
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error);
        } else {
            router.push("/login");
        }
    }

    // Main UI
    return (
        <main className="fixed h-full w-full bg-muted">
            <header className="flex items-center justify-between p-4 bg-cyan-500 shadow-md">
                <h1 className="text-4xl font-bold text-white">Welcome to the Chat App!</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                    Sign Out
                </button>
            </header>
            <div className="flex flex-col h-[calc(100%-64px)]">
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {messages.map((message, index) => (
                        <Message key={index} message={message}/>
                    ))}
                </div>
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex items-center p-4 bg-gray-100 border-t"
                >
                    <Textarea
                        className="flex-1 px-4 py-2 text-lg border rounded-md focus:ring-2 focus:ring-blue-400"
                        placeholder="Say something..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input}
                        className="ml-4 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                    >
                        <Send size={24}/>
                    </Button>
                </form>
            </div>
        </main>
    );
}
