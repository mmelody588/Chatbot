'use client';

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async (type: "signIn" | "signUp") => {
        setLoading(true);
        setError("");
        const { error } =
            type === "signIn"
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

        if (error) {
            setError(error.message);
        } else {
            console.log("Router object:", router);
            router.push("/");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-teal-500">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div>
                    <button
                        disabled={loading}
                        onClick={() => handleAuth("signIn")}
                        className={`w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md ${
                            loading ? "opacity-50" : "hover:bg-blue-600"
                        }`}
                    >
                        Login
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleAuth("signUp")}
                        className={`w-full px-4 py-2 font-bold text-white bg-green-500 rounded-md ${
                            loading ? "opacity-50" : "hover:bg-green-600"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
