//import { openai } from "@ai-sdk/openai";
//import { streamText } from "ai";
//import {useChat} from "ai/react";

import { OpenAI } from "openai";
//import { supabase } from "@/app/lib/supabase";


//const { Configuration, OpenAIApi } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if(!Array.isArray(messages) || messages.length === 0) {
            return new Response("Invalid messages payload", { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I don't understand.";

        return new Response(JSON.stringify({ choices: [{ message: { content: assistantMessage}}]}), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
