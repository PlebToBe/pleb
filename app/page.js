"use client";
import { useState, useEffect } from "react";
import { createStarBackground } from "./stars";

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("us");
    const [loading, setLoading] = useState(false);
    const [adsLoaded, setAdsLoaded] = useState(false);

    const normiePlaceholders = {
        us: "Yo! Wassup? What do you want?",
        uk: "Oi, what you staring at?",
        de: "Ja ja, und was willst du jetzt?",
        es: "Qué dices, pringao?",
        fr: "Bon, tu veux quoi là?",
        it: "Oye bello, che vuoi?",
        ru: "Ну, чё надо?",
        jp: "おい、何か用か？",
        cn: "哎，你要干嘛？",
        hi: "क्या चाहिए भाई?",
        br: "E aí mano, fala logo!",
    };

    useEffect(() => {
        createStarBackground();
        setAdsLoaded(true);
    }, []);

    useEffect(() => {
        setMessages([{ role: "bot", content: normiePlaceholders[selectedCountry] || "Yo! Wassup?" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry]);

    const handleCountryChange = (event) => {
        const newCountry = event.target.value;
        setSelectedCountry(newCountry);
        setMessages([{ role: "bot", content: normiePlaceholders[newCountry] || "Yo! Wassup?" }]);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages([...messages, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${window.location.origin}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: input, selectedCountry }),
            });

            const data = await response.json();
            if (data.message) {
                setMessages([...messages, userMessage, { role: "bot", content: data.message }]);
            }
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen text-white font-sans">

            {/* Ads: Left Skyscraper */}
            {adsLoaded && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden md:block">
                    <div dangerouslySetInnerHTML={{
                        __html: `
                        <ins class="adsbygoogle"
                            style="display:inline-block;width:160px;height:600px"
                            data-ad-client="ca-pub-2753183170718760"
                            data-ad-slot="0987654321"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                    `}} />
                </div>
            )}

            {/* Ads: Right Skyscraper */}
            {adsLoaded && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
                    <div dangerouslySetInnerHTML={{
                        __html: `
                        <ins class="adsbygoogle"
                            style="display:inline-block;width:160px;height:600px"
                            data-ad-client="ca-pub-2753183170718760"
                            data-ad-slot="0987654321"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                    `}} />
                </div>
            )}

            {/* Contenido Central */}
            <h1 className="text-7xl md:text-9xl font-bold font-[Barrio] tracking-wide mb-4 z-10 text-yellow-400">
                Pleb.be
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-lg text-center z-10">
                Be Pleb. Be Free. Be Stupid.
            </p>

            {/* Selector de Normie */}
            <select
                className="mt-4 p-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md hover:bg-gray-700 transition-all z-10"
                value={selectedCountry}
                onChange={handleCountryChange}
            >
                <option value="us">🇺🇸 American Redneck</option>
                <option value="uk">🇬🇧 British Lad</option>
                <option value="de">🇩🇪 German Conspiracy Guy</option>
                <option value="es">🇪🇸 Spanish Cuñado</option>
                <option value="fr">🇫🇷 French Intellectual</option>
                <option value="it">🇮🇹 Italian Mafia Wannabe</option>
                <option value="ru">🇷🇺 Russian Cold War Veteran</option>
                <option value="br">🇧🇷 Brazilian Internet Guru</option>
                <option value="jp">🇯🇵 Japanese Anime Otaku</option>
                <option value="cn">🇨🇳 Chinese Street Philosopher</option>
            </select>

            {/* Chatbox */}
            <div className="relative z-10 w-[70%] h-[400px] bg-gray-900/80 rounded-xl p-4 overflow-y-auto mt-6 border border-gray-700 shadow-xl">
                {messages.map((msg, index) => (
                    <p key={index} className={msg.role === "user" ? "text-blue-300" : "text-green-300"}>
                        {msg.role === "user" ? "You: " : "Pleb AI: "}
                        {msg.content}
                    </p>
                ))}
                {loading && <p className="text-gray-400">Thinking... 🤔</p>}
            </div>

            {/* Input & Send Button */}
            <div className="relative z-10 flex w-[70%]">
                <input
                    className="p-3 flex-grow bg-gray-800 text-white border border-gray-600 rounded-l-lg outline-none focus:ring-2 focus:ring-yellow-400"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="bg-yellow-500 px-5 py-3 rounded-r-lg text-black font-bold hover:bg-yellow-400 transition-all"
                    onClick={sendMessage}
                >
                    🚀 Send
                </button>
            </div>

            {/* MegaBanner Inferior */}
            {adsLoaded && (
                <div className="flex justify-center mt-4">
                    <div dangerouslySetInnerHTML={{
                        __html: `
                        <ins class="adsbygoogle"
                            style="display:block"
                            data-ad-client="ca-pub-2753183170718760"
                            data-ad-slot="1234567890"
                            data-ad-format="horizontal"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                    `}} />
                </div>
            )}

            {/* Footer */}
            <footer className="text-gray-500 text-sm mt-6 text-center z-10">
                Pleb.be is like talking to that one guy at the bar who knows everything, but actually nothing. Proceed at your own risk.
            </footer>
        </div>
    );
}