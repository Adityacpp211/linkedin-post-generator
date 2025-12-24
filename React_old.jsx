import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    Newspaper,
    BarChart3,
    Settings,
    Zap,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Search,
    Bell,
    Menu,
    X,
    Share2,
    Heart,
    MessageSquare,
    Repeat,
    Send,
    RefreshCw,
    Cpu,
    Globe,
    TrendingUp,
    Sparkles,
    Loader2,
    Microscope,
    ChevronDown,
    Image as ImageIcon,
    Headphones,
    Play,
    Square,
    Plus,
    Trash2,
    Check,
    AlertCircle,
    Filter,
    XCircle,
    Archive,
    Wand2,
    Users,
    Smile,
    Frown,
    HelpCircle,
    ArrowRight,
    Volume2
} from 'lucide-react';

const App = () => {
    // Navigation & View State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);

    // Content Queue State
    const [queueFilter, setQueueFilter] = useState('All'); // All, Pending, Approved, Rejected

    // Agent State
    const [agentStatus, setAgentStatus] = useState('idle');
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);

    // AI Feature States
    const [isGeneratingTrends, setIsGeneratingTrends] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [generatedPreviewText, setGeneratedPreviewText] = useState('');
    const [analyzingIds, setAnalyzingIds] = useState(new Set());
    const [draftTone, setDraftTone] = useState('enthusiastic');

    // New Feature States
    const [isRefining, setIsRefining] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedComments, setSimulatedComments] = useState({});

    // Multimedia State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [postImages, setPostImages] = useState({});
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioRef = useRef(null);

    const apiKey = ""; // API Key provided by environment

    // Mock Data Initialization
    const initialTrends = [
        {
            id: 1,
            title: "Gemini 1.5 Pro Release",
            category: "AI Models",
            score: 98,
            source: "Google DeepMind",
            summary: "Google announces massive context window upgrade and improved reasoning capabilities.",
            status: "Approved",
            analysis: null
        },
        {
            id: 2,
            title: "NVIDIA H200 Benchmarks",
            category: "Hardware",
            score: 94,
            source: "TechCrunch",
            summary: "New benchmarks show 40% inference speed improvement over previous generation.",
            status: "Pending",
            analysis: null
        },
        {
            id: 3,
            title: "React 19 Server Actions",
            category: "Web Dev",
            score: 89,
            source: "React Blog",
            summary: "Full stable release of Server Actions changing the data fetching paradigm.",
            status: "Rejected",
            analysis: null
        }
    ];

    const [weekTrends, setWeekTrends] = useState(initialTrends);

    // SAFE FILTERING
    const filteredTrends = weekTrends.filter(t =>
        (t.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (t.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const currentTrend = filteredTrends[selectedPostIndex] || filteredTrends[0];

    // --- Effects ---

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlayingAudio(false);
        }
    }, [selectedPostIndex, activeTab]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAgentStatus(prev => prev === 'idle' ? 'scanning' : 'idle');
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => setErrorMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    // --- Utility Functions ---

    const showError = (msg) => {
        console.error(msg);
        setErrorMsg(msg);
    };

    const safeParseJSON = (text) => {
        try {
            if (!text) return null;
            let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBracket = cleaned.indexOf('[');
            const lastBracket = cleaned.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                cleaned = cleaned.substring(firstBracket, lastBracket + 1);
            }
            return JSON.parse(cleaned);
        } catch (e) {
            console.error("JSON Parse Error on text:", text);
            return null;
        }
    };

    // --- AUDIO PROCESSING UTILS (Replaces Python Logic) ---
    // This constructs a valid WAV header for the raw PCM16 data returned by Gemini
    const addWavHeader = (samples, sampleRate = 24000, numChannels = 1) => {
        const buffer = new ArrayBuffer(44 + samples.length);
        const view = new DataView(buffer);

        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2 * numChannels, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length, true);

        const bytes = new Uint8Array(buffer);
        bytes.set(samples, 44);

        return buffer;
    };

    // --- Handlers ---

    const handleApprove = () => {
        if (!currentTrend) return;
        updateStatus(currentTrend.id, 'Approved');
        setAgentStatus('queued');
        setTimeout(() => setAgentStatus('idle'), 2000);
    };

    const updateStatus = (id, newStatus) => {
        const updatedTrends = weekTrends.map(t =>
            t.id === id ? { ...t, status: newStatus } : t
        );
        setWeekTrends(updatedTrends);
    };

    const handleAddTopic = () => {
        const newTopic = {
            id: Date.now(),
            title: "New Manual Topic",
            category: "Custom",
            score: 80,
            source: "Manual Entry",
            summary: "Enter your summary here...",
            status: "Pending",
            analysis: null
        };
        setWeekTrends([newTopic, ...weekTrends]);
        if (activeTab === 'dashboard') {
            setSelectedPostIndex(0);
        }
    };

    const handleDeleteTopic = (e, id) => {
        if (e) e.stopPropagation();
        const newTrends = weekTrends.filter(t => t.id !== id);
        setWeekTrends(newTrends);
        if (selectedPostIndex >= newTrends.length) setSelectedPostIndex(Math.max(0, newTrends.length - 1));
    };

    // --- API Integrations ---

    const handleRegenerateTrends = async () => {
        setIsGeneratingTrends(true);
        setAgentStatus('scanning');

        try {
            const prompt = `
        Generate 3 realistic, high-tech news headlines for a weekly digest. 
        Return ONLY a JSON array with this structure:
        [{ "id": 0, "title": "Headline", "category": "Tech", "score": 90, "source": "Source", "summary": "Summary", "status": "Pending", "analysis": null }]
      `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedText) {
                const newTrends = safeParseJSON(generatedText);
                if (newTrends && Array.isArray(newTrends)) {
                    const formattedTrends = newTrends.map((t, i) => ({ ...t, id: Date.now() + i }));
                    setWeekTrends(formattedTrends);
                    setSelectedPostIndex(0);
                    setGeneratedPreviewText('');
                    setPostImages({});
                    setSimulatedComments({});
                } else {
                    showError("Failed to parse AI response. Please try again.");
                }
            }
        } catch (error) {
            showError(`Scan failed: ${error.message}`);
        } finally {
            setIsGeneratingTrends(false);
            setAgentStatus('idle');
        }
    };

    const handleAnalyzeTrend = async (e, trendId) => {
        e.stopPropagation();
        if (analyzingIds.has(trendId)) return;

        setAnalyzingIds(prev => new Set(prev).add(trendId));
        setAgentStatus('analyzing');
        const trend = weekTrends.find(t => t.id === trendId);

        try {
            const prompt = `Analyze tech impact: "${trend.title}". Give 3 bullet points. Plain text.`;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (analysisText) {
                setWeekTrends(prev => prev.map(t => t.id === trendId ? { ...t, analysis: analysisText } : t));
            }
        } catch (error) {
            showError(`Analysis failed: ${error.message}`);
        } finally {
            setAnalyzingIds(prev => { const next = new Set(prev); next.delete(trendId); return next; });
            setAgentStatus('idle');
        }
    };

    const handleGeneratePreview = async () => {
        if (!currentTrend) return;
        setIsGeneratingPreview(true);
        setAgentStatus('generating');

        let toneInstruction = "Style: High energy, viral tech influencer, lots of hype. Use 🚀 emojis.";
        if (draftTone === 'skeptical') toneInstruction = "Style: Critical, analytical, dry humor.";
        if (draftTone === 'executive') toneInstruction = "Style: Formal, business value focused, minimal emojis.";

        try {
            const prompt = `Write a tweet (max 280 chars) about: "${currentTrend.title} - ${currentTrend.summary}". ${toneInstruction} Include hashtags.`;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                setGeneratedPreviewText(text);
                setSimulatedComments(prev => {
                    const next = { ...prev };
                    delete next[currentTrend.id];
                    return next;
                });
            }
        } catch (error) {
            showError(`Drafting failed: ${error.message}`);
        } finally {
            setIsGeneratingPreview(false);
            setAgentStatus('idle');
        }
    };

    const handleRefineDraft = async (instruction) => {
        if (!generatedPreviewText) return;
        setIsRefining(true);
        setAgentStatus('refining');

        try {
            const prompt = `Rewrite this social media post. Instruction: ${instruction}. 
      Current Text: "${generatedPreviewText}"
      Return ONLY the new text. Keep it under 280 chars.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) setGeneratedPreviewText(text);
        } catch (error) {
            showError(`Refine failed: ${error.message}`);
        } finally {
            setIsRefining(false);
            setAgentStatus('idle');
        }
    };

    const handleSimulateComments = async () => {
        if (!currentTrend || !generatedPreviewText) return;
        setIsSimulating(true);
        setAgentStatus('simulating');

        try {
            const prompt = `
        Simulate 3 realistic user replies to this tweet: "${generatedPreviewText}".
        Return JSON array: [{ "user": "Name", "handle": "@handle", "text": "Comment text", "sentiment": "positive/neutral/negative" }]
      `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedText) {
                const comments = safeParseJSON(generatedText);
                if (comments && Array.isArray(comments)) {
                    setSimulatedComments(prev => ({
                        ...prev,
                        [currentTrend.id]: comments
                    }));
                }
            }
        } catch (error) {
            showError(`Simulation failed: ${error.message}`);
        } finally {
            setIsSimulating(false);
            setAgentStatus('idle');
        }
    };

    const handleGenerateImage = async () => {
        if (!currentTrend) return;
        setIsGeneratingImage(true);
        setAgentStatus('creating_visuals');

        try {
            const prompt = `Editorial tech illustration for "${currentTrend.title}". Futuristic, 3D abstract render, neon, cyberpunk, 8k.`;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
            if (base64Image) {
                setPostImages(prev => ({ ...prev, [currentTrend.id]: `data:image/png;base64,${base64Image}` }));
            } else {
                showError("No image generated.");
            }
        } catch (error) {
            showError(`Image generation failed: ${error.message}`);
        } finally {
            setIsGeneratingImage(false);
            setAgentStatus('idle');
        }
    };

    const handleToggleAudio = async () => {
        if (isPlayingAudio) { audioRef.current?.pause(); setIsPlayingAudio(false); return; }
        if (!currentTrend) return;
        setIsGeneratingAudio(true); setAgentStatus('speaking');

        try {
            const textToRead = generatedPreviewText || `${currentTrend.title}. ${currentTrend.summary}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: textToRead }] }],
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: "Kore" }
                                }
                            }
                        }
                    })
                }
            );

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const audioContent = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (audioContent) {
                // Decode Base64 to binary
                const binaryString = window.atob(audioContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // IMPORTANT: Gemini TTS returns raw PCM16. We must add a WAV header to play it in browser.
                const wavBuffer = addWavHeader(bytes, 24000, 1);
                const blob = new Blob([wavBuffer], { type: 'audio/wav' });

                if (audioRef.current) audioRef.current.pause();
                audioRef.current = new Audio(URL.createObjectURL(blob));
                audioRef.current.onended = () => setIsPlayingAudio(false);
                audioRef.current.play();
                setIsPlayingAudio(true);
            } else {
                throw new Error("No audio data returned from API");
            }
        } catch (error) {
            console.error(error);
            showError(`Audio failed: ${error.message}. TTS might be busy.`);
            setIsPlayingAudio(false);
        } finally {
            setIsGeneratingAudio(false);
            setAgentStatus('idle');
        }
    };

    // --- Render Helpers ---

    const renderDashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[600px]">
            {/* Left Column: AI Findings */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                            <Sparkles size={18} className="text-fuchsia-400" />
                            Agent Findings
                        </h3>
                        <p className="text-sm text-slate-400">Top {filteredTrends.length} signals detected this week.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAddTopic} className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/50 transition-colors">
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={handleRegenerateTrends}
                            disabled={isGeneratingTrends}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 backdrop-blur-md text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingTrends ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {isGeneratingTrends ? 'Scanning...' : 'Scan Network'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
                    {filteredTrends.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
                            <Search size={24} className="mb-2 opacity-50" />
                            <span>No trends found matching "{searchQuery}"</span>
                        </div>
                    ) : (
                        filteredTrends.map((trend, idx) => (
                            <div
                                key={trend.id}
                                onClick={() => { setSelectedPostIndex(idx); setGeneratedPreviewText(''); }}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden backdrop-blur-sm ${filteredTrends[selectedPostIndex]?.id === trend.id
                                    ? 'bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border-indigo-500/50 shadow-xl shadow-indigo-900/20'
                                    : 'bg-slate-900/40 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                {/* Active Indicator Line */}
                                {filteredTrends[selectedPostIndex]?.id === trend.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-fuchsia-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]"></div>
                                )}

                                <div className="flex justify-between items-start mb-2 pl-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                        {trend.category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-slate-800">
                                            virality: {trend.score}%
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteTopic(e, trend.id)}
                                            className="text-slate-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <StatusBadge status={trend.status} />
                                    </div>
                                </div>

                                <div className="pl-3 relative z-10">
                                    <h4 className={`text-lg font-semibold mb-1 transition-colors ${filteredTrends[selectedPostIndex]?.id === trend.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {trend.title}
                                    </h4>
                                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{trend.summary}</p>

                                    {trend.analysis && (
                                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10 backdrop-blur-md">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                                                <Microscope size={12} /> INTELLIGENCE REPORT
                                            </div>
                                            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                                                {trend.analysis}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Globe size={12} />
                                            {trend.source}
                                        </div>

                                        <button
                                            onClick={(e) => handleAnalyzeTrend(e, trend.id)}
                                            disabled={analyzingIds.has(trend.id) || trend.analysis}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${trend.analysis
                                                ? 'bg-slate-800/30 text-slate-500 cursor-default border border-transparent'
                                                : 'bg-slate-800/80 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/50'
                                                }`}
                                        >
                                            {analyzingIds.has(trend.id) ? (
                                                <Loader2 size={12} className="animate-spin text-indigo-400" />
                                            ) : (
                                                <Microscope size={12} className={trend.analysis ? 'text-slate-500' : 'text-indigo-400'} />
                                            )}
                                            {analyzingIds.has(trend.id) ? 'Processing...' : trend.analysis ? 'Analyzed' : 'Deep Dive'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="lg:col-span-5 h-full flex flex-col">
                <div className="flex-1 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative ring-1 ring-white/5">

                    {/* Controls Header */}
                    <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-black/20">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Output Preview</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 group">
                                <select
                                    value={draftTone}
                                    onChange={(e) => setDraftTone(e.target.value)}
                                    className="w-full appearance-none bg-black/40 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-800/50"
                                >
                                    <option value="enthusiastic">🚀 Tone: Hype / Viral</option>
                                    <option value="skeptical">🧐 Tone: Skeptical</option>
                                    <option value="executive">👔 Tone: Executive</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300" />
                            </div>

                            <button
                                onClick={handleGeneratePreview}
                                disabled={isGeneratingPreview || !currentTrend}
                                className="text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20 whitespace-nowrap font-medium"
                            >
                                {isGeneratingPreview ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGeneratingPreview ? 'Drafting...' : 'Draft'}
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto bg-gradient-to-br from-slate-900 to-black relative">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        {/* Mock Twitter Post */}
                        {!currentTrend ? (
                            <div className="text-slate-600 flex flex-col items-center gap-2 mt-20">
                                <Newspaper size={32} />
                                <span className="text-sm">Select a trend to preview</span>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm flex flex-col gap-4">
                                <div className="bg-black/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl relative z-10 transition-all duration-500">
                                    {isGeneratingPreview && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 size={32} className="text-indigo-400 animate-spin" />
                                                <span className="text-xs font-mono text-indigo-300 tracking-widest">GENERATING COPY...</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            N
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-white text-[15px]">Nexus Tech Bot</span>
                                                <CheckCircle2 size={14} className="text-blue-400 fill-blue-400/20" />
                                                <span className="text-slate-500 text-[14px]">@nexus_ai · just now</span>
                                            </div>

                                            <div className="mt-2 text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                                                {generatedPreviewText ? (
                                                    generatedPreviewText
                                                ) : (
                                                    <>
                                                        <span className="text-indigo-400 font-bold">Waiting for draft...</span>
                                                        <br />
                                                        Select "Draft" above to generate a viral post for:
                                                        <br />
                                                        "{currentTrend.title}"
                                                    </>
                                                )}
                                            </div>

                                            {/* Audio Player and Refine Tools */}
                                            {generatedPreviewText && !isGeneratingPreview && (
                                                <div className="flex flex-col gap-2 mt-3 mb-1">
                                                    {/* Audio Player Row */}
                                                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                        <button
                                                            onClick={handleToggleAudio}
                                                            disabled={isGeneratingAudio}
                                                            className={`p-2 rounded-full transition-all ${isPlayingAudio
                                                                ? 'bg-indigo-500 text-white animate-pulse'
                                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                                                }`}
                                                        >
                                                            {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlayingAudio ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                                        </button>
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">AI Audio Brief</span>
                                                            <div className="h-1 w-full bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                                {isPlayingAudio && <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Refine Tools */}
                                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                        <button onClick={() => handleRefineDraft("Make it shorter")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Shorten</button>
                                                        <button onClick={() => handleRefineDraft("Make it more professional")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Pro</button>
                                                        <button onClick={() => handleRefineDraft("Make it savage/sarcastic")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Savage</button>
                                                        {isRefining && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Link Card with Image Generation */}
                                            <div className="mt-3 rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50 group/card cursor-pointer hover:border-slate-700 transition-colors">
                                                <div className="h-40 bg-slate-900 w-full relative group overflow-hidden">
                                                    {/* Image Display */}
                                                    {postImages[currentTrend.id] ? (
                                                        <img
                                                            src={postImages[currentTrend.id]}
                                                            alt="Generated visual"
                                                            className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                                                            <ImageIcon className="text-slate-700 mb-2" size={32} />
                                                            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">No Visual Asset</span>
                                                        </div>
                                                    )}

                                                    {/* Image Generation Overlay Button */}
                                                    <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 ${postImages[currentTrend.id] ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                                        <button
                                                            onClick={handleGenerateImage}
                                                            disabled={isGeneratingImage}
                                                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all hover:scale-105"
                                                        >
                                                            {isGeneratingImage ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                                                            {isGeneratingImage ? 'Rendering 8K...' : 'Generate Visual ✨'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-black/40 p-3 backdrop-blur-md">
                                                    <div className="text-slate-500 text-xs font-mono mb-0.5">{currentTrend.source?.toLowerCase() || 'unknown'}.com</div>
                                                    <div className="text-slate-200 text-sm font-medium truncate">{currentTrend.title}</div>
                                                </div>
                                            </div>

                                            {/* Tweet Actions */}
                                            <div className="flex justify-between mt-4 text-slate-500 max-w-[90%]">
                                                <ActionIcon icon={<MessageSquare size={18} />} count="12" color="hover:text-blue-400" />
                                                <ActionIcon icon={<Repeat size={18} />} count="4" color="hover:text-green-400" />
                                                <ActionIcon icon={<Heart size={18} />} count="89" color="hover:text-pink-400" />
                                                <ActionIcon icon={<Share2 size={18} />} count="" color="hover:text-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Oracle Simulator Section */}
                                {generatedPreviewText && (
                                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                                <Users size={14} className="text-indigo-400" /> Oracle Simulator
                                            </h4>
                                            <button
                                                onClick={handleSimulateComments}
                                                disabled={isSimulating}
                                                className="text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-900/50 px-2 py-1 rounded transition-colors"
                                            >
                                                {isSimulating ? "Predicting..." : "Simulate Reactions"}
                                            </button>
                                        </div>

                                        {isSimulating ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 size={20} className="text-indigo-400 animate-spin" />
                                            </div>
                                        ) : simulatedComments[currentTrend.id] ? (
                                            <div className="space-y-3">
                                                {simulatedComments[currentTrend.id].map((comment, i) => (
                                                    <div key={i} className="flex gap-2 text-xs">
                                                        <div className={`w-1 h-full rounded-full shrink-0 mt-1 ${comment.sentiment === 'positive' ? 'bg-emerald-500' :
                                                            comment.sentiment === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
                                                            }`}></div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="font-bold text-slate-300">{comment.user}</span>
                                                                <span className="text-slate-600">{comment.handle}</span>
                                                            </div>
                                                            <p className="text-slate-400 leading-relaxed">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-slate-600 text-xs italic">
                                                Run simulator to predict audience engagement.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Schedule</span>
                            <span className="text-xs text-slate-300 font-mono">Mon, Oct 24 • 09:00 AM</span>
                        </div>
                        <button
                            onClick={handleApprove}
                            disabled={!currentTrend || currentTrend.status === 'Approved'}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg ${currentTrend?.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default'
                                : 'bg-white text-black hover:bg-slate-200 hover:scale-105'
                                }`}
                        >
                            {currentTrend?.status === 'Approved' ? <Check size={16} /> : <Send size={16} />}
                            {currentTrend?.status === 'Approved' ? 'Queued' : 'Approve & Queue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContentQueue = () => {
        // Filter queue items based on selected tab
        const filteredQueue = weekTrends.filter(t => {
            if (queueFilter === 'All') return true;
            return t.status === queueFilter;
        });

        return (
            <div className="h-full flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                {/* Queue Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Newspaper size={20} className="text-indigo-400" />
                            Content Queue
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Manage and moderate generated content.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setQueueFilter(status)}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${queueFilter === status
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List View */}
                <div className="flex-1 overflow-y-auto p-2">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0F1117] z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-white/5">Status</th>
                                <th className="p-4 border-b border-white/5">Topic</th>
                                <th className="p-4 border-b border-white/5">Category</th>
                                <th className="p-4 border-b border-white/5 text-right">Score</th>
                                <th className="p-4 border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredQueue.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Archive size={32} className="opacity-20" />
                                            <span>No items found in {queueFilter} queue.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQueue.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-200">{item.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{item.source}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-slate-400">
                                            {item.score}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {item.status !== 'Approved' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'Approved')}
                                                        className="p-1.5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-md transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                {item.status !== 'Rejected' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'Rejected')}
                                                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDeleteTopic(e, item.id)}
                                                    className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPlaceholderTab = (title, icon) => (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800">
                {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 48, className: "opacity-50" }) : null}
            </div>
            <h2 className="text-2xl font-bold text-slate-300">{title}</h2>
            <p className="text-sm">This module is currently in development.</p>
        </div>
    );

    // --- Main Render ---

    return (
        <div className="flex h-screen bg-[#050505] text-slate-300 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative">

            {/* Ambient Background Effects */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar Navigation */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col z-50`}
            >
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Cpu size={18} className="text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-white tracking-tight text-lg">Nexus<span className="text-indigo-400">AI</span></span>}
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Newspaper size={20} />} label="Content Queue" active={activeTab === 'content'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('content')} />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'analytics'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('analytics')} />
                    <NavItem icon={<Globe size={20} />} label="Sources" active={activeTab === 'sources'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('sources')} />
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('settings')} />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full mt-2 flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">

                {/* Header */}
                <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-semibold text-lg tracking-tight">Mission Control</h2>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-500 ${agentStatus !== 'idle'
                            ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 shadow-[0_0_15px_rgba(232,121,249,0.3)]'
                            : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                            }`}>
                            {agentStatus !== 'idle' && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />}
                            {agentStatus !== 'idle' ? `AGENT: ${agentStatus.replace('_', ' ')}` : 'AGENT: STANDBY'}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search database..."
                                className="bg-black/40 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all text-slate-200 placeholder-slate-600"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/30 hover:bg-slate-800 rounded-full"
                            >
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-fuchsia-500 rounded-full border border-black"></span>
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notifications</h4>
                                    <div className="text-sm text-slate-300 py-2 border-b border-slate-800">🚀 Gemini 1.5 analysis complete</div>
                                    <div className="text-sm text-slate-300 py-2">✅ Weekly digest queued</div>
                                </div>
                            )}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-slate-800 shadow-lg cursor-pointer hover:scale-105 transition-transform"></div>
                    </div>
                </header>

                {/* Dynamic Content Render */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-[1600px] mx-auto space-y-8 h-full">

                        {/* Top Stats Row (Always visible for aesthetics) */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Engagement Rate"
                                    value="+24.5%"
                                    subtitle="vs last week"
                                    trend="up"
                                    icon={<TrendingUp size={24} className="text-emerald-400" />}
                                />
                                <StatCard
                                    title="Sources Scanned"
                                    value="1,240"
                                    subtitle="Active nodes"
                                    trend="neutral"
                                    icon={<Globe size={24} className="text-cyan-400" />}
                                />
                                <StatCard
                                    title="Next Execution"
                                    value="08:00 AM"
                                    subtitle="T-minus 14h 30m"
                                    trend="neutral"
                                    icon={<Clock size={24} className="text-fuchsia-400" />}
                                />
                            </div>
                        )}

                        {/* Tab Switcher */}
                        {activeTab === 'dashboard' ? renderDashboard() :
                            activeTab === 'content' ? renderContentQueue() :
                                activeTab === 'analytics' ? renderPlaceholderTab("Analytics Hub", <BarChart3 />) :
                                    activeTab === 'sources' ? renderPlaceholderTab("Source Network", <Globe />) :
                                        renderPlaceholderTab("System Settings", <Settings />)}

                    </div>
                </div>
            </main>

            {/* Error Toast */}
            {errorMsg && (
                <div className="fixed bottom-6 right-6 max-w-sm bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-start gap-3 z-[100] animate-in slide-in-from-right fade-in duration-300">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-100 mb-1">System Error</h4>
                        <p className="text-xs opacity-90">{errorMsg}</p>
                    </div>
                    <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Polished Subcomponents ---

const NavItem = ({ icon, label, active, collapsed, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${active
            ? 'text-white bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
            }`}
    >
        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]"></div>}

        <div className={`relative z-10 ${active ? 'text-fuchsia-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
            {icon}
        </div>

        {!collapsed && (
            <span className="relative z-10 text-sm font-medium tracking-wide">{label}</span>
        )}
    </button>
);

const StatCard = ({ title, value, subtitle, trend, icon }) => (
    <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-slate-800/50 rounded-xl group-hover:bg-slate-800 transition-colors">
                {icon}
            </div>
            {trend === 'up' && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    +2.4% <TrendingUp size={10} />
                </span>
            )}
        </div>
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <div className="text-sm text-slate-400 font-medium">{title}</div>
        <div className="text-xs text-slate-600 mt-1 font-mono">{subtitle}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Approved: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',
        Pending: 'text-amber-400 bg-amber-900/30 border-amber-500/30',
        Rejected: 'text-rose-400 bg-rose-900/30 border-rose-500/30',
    };

    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[status] || styles.Pending}`}>
            {status}
        </span>
    );
};

const ActionIcon = ({ icon, count, color }) => (
    <div className={`flex items-center gap-1.5 group cursor-pointer transition-colors ${color}`}>
        {icon}
        {count && <span className="text-xs font-medium">{count}</span>}
    </div>
);

export default App;