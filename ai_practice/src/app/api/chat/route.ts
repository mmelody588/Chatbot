//import { openai } from "@ai-sdk/openai";
//import { streamText } from "ai";
//import {useChat} from "ai/react";

import { OpenAI } from "openai";


//const { Configuration, OpenAIApi } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    // console.log("API route hit");

    try {
        const { messages } = await req.json();
        console.log("Received messages:", messages);

        if (!messages || !messages.length) {
            console.error("Invalid messages payload");
            return new Response("Invalid messages payload", { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            //stream: true,
        });

        return new Response(JSON.stringify(response), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response("Error communicating with OpenAI API", { status: 500 });
    }
}
