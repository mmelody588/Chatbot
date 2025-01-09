import { OpenAI } from 'openai';
//import { streamText } from 'ai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of openaiResponse) {
                    const text = chunk.choices?.[0]?.delta?.content || "";

                    // Skip empty chunks
                    if (!text.trim()) continue;

                    controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify({ role: "assistant", content: text.trim() })}\n\n`),
                    );
                }
                controller.close();
            },
        });

        // console.log("Stream: ", stream);
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        })
    } catch (error) {
        console.error(error);
        return new Response("Error communicating with OpenAI API", { status: 500 });
    }
}
