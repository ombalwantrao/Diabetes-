import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Search, 
  MapPin, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  sources?: { title: string; uri: string }[];
  isMapsResult?: boolean;
}

interface GeminiConsultantProps {
  currentMetrics: {
    glucose: number;
    bmi: number;
    bloodPressure: number;
    insulin: number;
    age: number;
    dpf: number;
    bmiCategory: string;
    ageCategory: string;
    riskPercentage: number;
    riskLevel: string;
    factors: string[];
  };
}

export const GeminiConsultant: React.FC<GeminiConsultantProps> = ({ currentMetrics }) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'search' | 'maps'>('chat');
  const [taskType, setTaskType] = useState<'fast' | 'general' | 'complex'>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I'm **DiaConsult AI**, powered by Google Gemini. I have loaded the patient's current diagnostic metrics:
- **Glucose**: ${currentMetrics.glucose} mg/dL
- **BMI**: ${currentMetrics.bmi} kg/m² (${currentMetrics.bmiCategory})
- **Evaluated ML Risk**: **${currentMetrics.riskPercentage}% (${currentMetrics.riskLevel})**

How can I assist? You can ask clinical questions, conduct live **Google Search Grounding** for latest medical guidelines, or use **Google Maps Grounding** to locate nearby diabetic centers.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('Pune, Maharashtra');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handler for regular Multi-Turn Chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      if (activeMode === 'chat') {
        const conversationHistory = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content
        }));

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            taskType,
            patientMetrics: currentMetrics
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else if (activeMode === 'search') {
        // Google Search Grounding with gemini-3.5-flash
        const res = await fetch('/api/gemini/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            patientContext: currentMetrics
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Search Grounding failed`);
        }

        const data = await res.json();
        const searchMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash (Google Search Grounding)',
          sources: data.sources
        };
        setMessages(prev => [...prev, searchMsg]);
      } else if (activeMode === 'maps') {
        // Google Maps Grounding with gemini-3.5-flash
        const res = await fetch('/api/gemini/maps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Find diabetes specialized clinics, endocrinologists, and pathology labs for ${query} near ${locationQuery}`,
            location: locationQuery,
            riskLevel: currentMetrics.riskLevel
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Maps Grounding failed`);
        }

        const data = await res.json();
        const mapsMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash (Google Maps Grounding)',
          isMapsResult: true
        };
        setMessages(prev => [...prev, mapsMsg]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error executing request.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Conversation restarted. I have the patient's current risk data (${currentMetrics.riskPercentage}%, ${currentMetrics.riskLevel}). Ask me any clinical question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[740px]">
      {/* Header with Mode Switchers */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">DiaConsult AI</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                Gemini Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Clinical metabolic advisor • Multi-turn Chat, Search & Maps Grounding
            </p>
          </div>
        </div>

        {/* Action Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
              activeMode === 'chat'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chatbot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('search')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
              activeMode === 'search'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Grounding</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('maps')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
              activeMode === 'maps'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Grounding</span>
          </button>
        </div>
      </div>

      {/* Model & Setting Sub-bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3">
          {activeMode === 'chat' && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-500">Gemini Role/Engine:</span>
              <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setTaskType('fast')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    taskType === 'fast' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Fast speed (gemini-3.1-flash-lite)"
                >
                  ⚡ Fast
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('general')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    taskType === 'general' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="General tasks (gemini-3.5-flash)"
                >
                  General (3.5 Flash)
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('complex')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    taskType === 'complex' ? 'bg-purple-700 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Complex tasks (gemini-3.1-pro-preview)"
                >
                  🧠 Deep Pro
                </button>
              </div>
            </div>
          )}

          {activeMode === 'search' && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Search className="w-3.5 h-3.5" />
              <span>Grounded in live Google Search results (ADA Guidelines, PubMed, Clinical Trials)</span>
            </div>
          )}

          {activeMode === 'maps' && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-500">Location:</span>
              <input
                type="text"
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                placeholder="e.g. Pune / Mumbai / Satara"
                className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-800 focus:outline-blue-500"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Assistant Metadata Tag */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      DiaConsult AI
                    </span>
                    {msg.modelUsed && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body with line breaks */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Search Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                      Google Search Grounding Sources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded text-[11px] font-medium transition max-w-[280px] truncate"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Maps Indicator */}
                {msg.isMapsResult && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>Locations grounded with Google Maps Platform</span>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-600 font-medium ml-1">
                {activeMode === 'search'
                  ? 'Searching medical literature with Google Search...'
                  : activeMode === 'maps'
                  ? 'Querying Google Maps for specialized clinics...'
                  : 'Consulting Gemini clinical model...'}
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-semibold shrink-0">Quick Ask:</span>
        {activeMode === 'chat' && (
          <>
            <button
              type="button"
              onClick={() => {
                setInputQuery(`Explain why this patient has a ${currentMetrics.riskPercentage}% risk score.`);
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-slate-700 whitespace-nowrap transition"
            >
              Analyze current risk factors
            </button>
            <button
              type="button"
              onClick={() => {
                setInputQuery('What dietary and exercise changes can lower this patient’s Glucose_BMI interaction index?');
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-slate-700 whitespace-nowrap transition"
            >
              Lifestyle modifications plan
            </button>
            <button
              type="button"
              onClick={() => {
                setInputQuery('What lab tests should be ordered next (e.g. HbA1c, OGTT, C-peptide)?');
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-slate-700 whitespace-nowrap transition"
            >
              Recommended next diagnostic tests
            </button>
          </>
        )}

        {activeMode === 'search' && (
          <>
            <button
              type="button"
              onClick={() => setInputQuery('American Diabetes Association 2024 standards for pre-diabetes fasting plasma glucose')}
              className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg text-emerald-800 whitespace-nowrap transition"
            >
              ADA 2024 Glucose Standards
            </button>
            <button
              type="button"
              onClick={() => setInputQuery('Latest clinical trials on SGLT2 inhibitors and metformin in early metabolic syndrome')}
              className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg text-emerald-800 whitespace-nowrap transition"
            >
              Metformin & Early Interventions
            </button>
          </>
        )}

        {activeMode === 'maps' && (
          <>
            <button
              type="button"
              onClick={() => setInputQuery('Top rated diabetic care hospitals and endocrinologists')}
              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg text-amber-800 whitespace-nowrap transition"
            >
              Top Diabetes Clinics
            </button>
            <button
              type="button"
              onClick={() => setInputQuery('NABL accredited diagnostic labs for fasting blood sugar and HbA1c testing')}
              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg text-amber-800 whitespace-nowrap transition"
            >
              Accredited Diagnostic Labs
            </button>
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            activeMode === 'search'
              ? 'Enter clinical topic to search latest guidelines (Google Search Grounding)...'
              : activeMode === 'maps'
              ? `Search diabetic clinics or diagnostic labs near ${locationQuery}...`
              : 'Ask DiaConsult AI anything about this patient\'s metrics or diabetes care...'
          }
          className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 transition shadow-xs ${
            isLoading || !inputQuery.trim()
              ? 'bg-slate-300 cursor-not-allowed text-slate-500'
              : activeMode === 'search'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : activeMode === 'maps'
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
