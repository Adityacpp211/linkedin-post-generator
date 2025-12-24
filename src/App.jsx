import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, Newspaper, BarChart3, Settings, Globe, TrendingUp, Clock,
    Search, Bell, Menu, X, AlertCircle, Cpu
} from 'lucide-react';

import TrendList from './components/dashboard/TrendList';
import PreviewPanel from './components/preview/PreviewPanel';
import ContentQueue from './components/dashboard/ContentQueue';
import { safeParseJSON } from './utils/helpers';
import { addWavHeader } from './utils/audioUtils';

// --- Subcomponents within App logic ---
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

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key provided by environment

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

    const renderPlaceholderTab = (title, icon) => (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800">
                {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 48, className: "opacity-50" }) : null}
            </div>
            <h2 className="text-2xl font-bold text-slate-300">{title}</h2>
            <p className="text-sm">This module is currently in development.</p>
        </div>
    );

    const renderDashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[600px]">
            <TrendList
                trends={filteredTrends}
                selectedTrendId={currentTrend?.id}
                onSelectTrend={(id) => {
                    const idx = filteredTrends.findIndex(t => t.id === id);
                    setSelectedPostIndex(idx);
                    setGeneratedPreviewText('');
                }}
                onAddTopic={handleAddTopic}
                onRegenerateTrends={handleRegenerateTrends}
                isGeneratingTrends={isGeneratingTrends}
                searchQuery={searchQuery}
                onDeleteTopic={handleDeleteTopic}
                onAnalyzeTrend={handleAnalyzeTrend}
                analyzingIds={analyzingIds}
            />

            <PreviewPanel
                currentTrend={currentTrend}
                generatedPreviewText={generatedPreviewText}
                isGeneratingPreview={isGeneratingPreview}
                onGeneratePreview={handleGeneratePreview}
                draftTone={draftTone}
                setDraftTone={setDraftTone}
                isRefining={isRefining}
                onRefine={handleRefineDraft}
                isSimulating={isSimulating}
                onSimulate={handleSimulateComments}
                simulatedComments={simulatedComments}
                isGeneratingImage={isGeneratingImage}
                postImages={postImages}
                onGenerateImage={handleGenerateImage}
                isGeneratingAudio={isGeneratingAudio}
                isPlayingAudio={isPlayingAudio}
                onToggleAudio={handleToggleAudio}
                onApprove={handleApprove}
            />
        </div>
    );

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
                            activeTab === 'content' ? (
                                <ContentQueue
                                    trends={weekTrends}
                                    queueFilter={queueFilter}
                                    setQueueFilter={setQueueFilter}
                                    updateStatus={updateStatus}
                                    onDeleteTopic={handleDeleteTopic}
                                />
                            ) :
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

export default App;
