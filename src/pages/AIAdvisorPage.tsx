import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Wheat,
  Droplets,
  Bug,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Key,
  HelpCircle,
} from 'lucide-react';
import { generateAgriAdvice, speakText, stopSpeech, AIMessage } from '../services/aiAdvisor';

export const AIAdvisorPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'mr' | 'hi' | 'en') || 'mr';

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text:
        currentLang === 'mr'
          ? `🌾 **रामराम शेतकरी दादा! मी आपला AI कृषी मित्र आहे.**\n\nआपल्या **२० एकर शेतातील ऊस (८ एकर), गहू (६ एकर) आणि कांदा (४ एकर)** यांच्या खत नियोजनाबद्दल, कीड-रोग नियंत्रणाबद्दल किंवा पाणी व्यवस्थापनाबद्दल कोणताही प्रश्न विचारा. खालील जलद प्रश्नांवर टॅप करा किंवा माईक दाबून बोला!`
          : currentLang === 'hi'
          ? `🌾 **नमस्ते किसान भाई! मैं आपका AI कृषि मित्र हूँ।**\n\nअपने २० एकड़ खेत के गन्ने, गेहूं, प्याज, खाद या सिंचाई से संबंधित कोई भी सवाल पूछें। नीचे दिए गए किसी भी बटन पर क्लिक करें या बोलकर पूछें!`
          : `🌾 **Hello Farmer! I am your AI Farm Advisor.**\n\nAsk me anything regarding your 20-acre farm, Sugarcane, Wheat, Onion, fertilizers, disease cure, or water management. Tap any quick prompt below or use the microphone to speak!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    localStorage.getItem('smart_farm_gemini_key') || ''
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle Send Query
  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isThinking) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const advice = await generateAgriAdvice(textToSend, currentLang);
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: advice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error generating advice:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Input Speech Recognition
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('तुमच्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया टाइप करा.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'mr' ? 'mr-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Text-to-Speech Speak Aloud
  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopSpeech();
      setSpeakingId(null);
    } else {
      stopSpeech();
      speakText(text, currentLang);
      setSpeakingId(msgId);
    }
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { text: t('ai.prompt_sugarcane'), icon: '🎋', label: 'ऊस खत' },
    { text: t('ai.prompt_onion'), icon: '🧅', label: 'कांदा करपा' },
    { text: t('ai.prompt_wheat'), icon: '🌾', label: 'गहू पाणी' },
    { text: t('ai.prompt_canal'), icon: '💧', label: 'कालवा पाणी' },
    { text: t('ai.prompt_pump'), icon: '⚡', label: 'पंप वीज बचत' },
  ];

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/15 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🤖
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {t('ai.title')}
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wider">
                  Live AI 24x7
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {t('ai.tagline')}
              </p>
            </div>
          </div>

          {/* Optional Gemini API Key trigger */}
          <button
            onClick={() => setShowApiKeyModal(!showApiKeyModal)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition-colors self-start sm:self-auto"
            title="Google Gemini API Key कॉन्फिगर करा"
          >
            <Key className="w-3.5 h-3.5 text-yellow-300" />
            <span>Gemini API Key</span>
          </button>
        </div>
      </div>

      {/* Gemini API Key Box (Expandable) */}
      {showApiKeyModal && (
        <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-sm text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              Google Gemini AI Key (ऐच्छिक - Optional):
            </span>
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-600 text-[11px]">
            ॲपमध्ये स्वतःचा शक्तिशाली कृषी AI ज्ञानकोश अंतर्भूत आहे. जर तुम्हाला थेट Google Gemini 1.5 चा वापर करायचा असेल तर येथे API Key टाका:
          </p>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => {
                localStorage.setItem('smart_farm_gemini_key', apiKeyInput.trim());
                alert('Gemini Key जतन झाली!');
                setShowApiKeyModal(false);
              }}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors"
            >
              जतन करा
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompt Chips (Very convenient for father on phone!) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-600 px-1 flex items-center space-x-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('ai.quick_prompts')}</span>
        </span>
        <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.text)}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-2xl text-xs font-semibold whitespace-nowrap shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm max-w-none">
                  {msg.text}
                </div>
              </div>

              {/* Message Footer: Timestamp, Speak Aloud & Copy */}
              <div className="flex items-center space-x-3 px-2 text-[11px] text-slate-500">
                <span>{msg.timestamp}</span>

                {!isUser && (
                  <>
                    {/* Speak aloud button (TTS) */}
                    <button
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className={`flex items-center space-x-1 font-bold transition-colors ${
                        speakingId === msg.id
                          ? 'text-rose-600 animate-pulse'
                          : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                      title="आवाज ऐका"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>थांबवा</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('ai.speak_answer')}</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition-colors"
                      title="कॉपी करा"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">{t('ai.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कॉपी</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-2xl w-fit border border-emerald-200 animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>{t('ai.thinking')}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Microphone Voice Support */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-2"
      >
        {/* Voice Input Microphone */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-3 rounded-xl transition-all shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white animate-bounce shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
          title={isListening ? 'माईक बंद करा' : t('ai.voice_start')}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={isListening ? t('ai.voice_listening') : t('ai.input_placeholder')}
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center space-x-1.5 shadow-sm shrink-0"
        >
          <span>{t('ai.send')}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Legal & Agro-Expert Disclaimer */}
      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>{t('ai.disclaimer')}</span>
      </div>

    </div>
  );
};
