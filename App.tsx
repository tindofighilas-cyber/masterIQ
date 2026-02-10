
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AppState, Question, QuizResult } from './types';
import { generateQuestions, analyzeResult } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ question: string, isCorrect: boolean, category: string }[]>([]);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback states
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    setState(AppState.LOADING_QUESTIONS);
    try {
      const q = await generateQuestions();
      setQuestions(q);
      setAnswers([]);
      setCurrentQuestionIdx(0);
      setSelectedIdx(null);
      setShowFeedback(false);
      setState(AppState.QUIZ);
    } catch (err) {
      alert("عذراً، حدث خطأ أثناء تحميل الأسئلة. يرجى المحاولة لاحقاً.");
      setState(AppState.START);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (showFeedback) return; // Prevent double clicks during feedback

    const currentQ = questions[currentQuestionIdx];
    const isCorrect = optionIdx === currentQ.correctAnswerIndex;
    
    setSelectedIdx(optionIdx);
    setShowFeedback(true);

    const newAnswers = [
      ...answers,
      { 
        question: currentQ.text, 
        isCorrect, 
        category: currentQ.category 
      }
    ];

    // Wait for visual feedback before proceeding
    setTimeout(() => {
      setAnswers(newAnswers);
      setShowFeedback(false);
      setSelectedIdx(null);

      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1000);
  };

  const finishQuiz = async (finalAnswers: typeof answers) => {
    setState(AppState.CALCULATING);
    setIsLoading(true);
    
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const iqEstimate = 70 + (correctCount * (90 / questions.length));
    
    try {
      const analysisText = await analyzeResult(correctCount, questions.length, finalAnswers);
      setFinalResult({
        score: correctCount,
        totalQuestions: questions.length,
        iqEstimate: Math.round(iqEstimate),
        analysis: analysisText,
        categoryScores: {}
      });
      setState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setState(AppState.RESULT);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setState(AppState.START);
    setQuestions([]);
    setAnswers([]);
    setFinalResult(null);
    setSelectedIdx(null);
    setShowFeedback(false);
  };

  const getOptionStyles = (idx: number) => {
    if (!showFeedback) {
      return "border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 active:scale-[0.99]";
    }
    
    const currentQ = questions[currentQuestionIdx];
    const isCorrectChoice = idx === currentQ.correctAnswerIndex;
    const isSelectedChoice = idx === selectedIdx;

    if (isCorrectChoice) {
      return "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 animate-pulse";
    }
    
    if (isSelectedChoice && !isCorrectChoice) {
      return "border-rose-500 bg-rose-50 ring-2 ring-rose-200";
    }

    return "border-slate-100 opacity-50";
  };

  return (
    <Layout>
      {state === AppState.START && (
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100 max-w-lg w-full">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl animate-bounce">🧠</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">اكتشف قدراتك الذهنية</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            مرحباً بك في اختبار الذكاء الأكثر دقة. سنقوم بطرح مجموعة من الأسئلة المتنوعة لقياس مستوى ذكائك وتقديم تحليل مفصل لشخصيتك وقدراتك.
          </p>
          <div className="space-y-4 mb-8 text-right text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span>10 أسئلة مصممة بعناية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span>تحليل فوري باستخدام الذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span>تقييم للمنطق والرياضيات واللغة</span>
            </div>
          </div>
          <button 
            onClick={startQuiz}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            ابدأ الاختبار الآن
          </button>
        </div>
      )}

      {(state === AppState.LOADING_QUESTIONS || state === AppState.CALCULATING) && (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {state === AppState.LOADING_QUESTIONS ? "جاري تحضير الأسئلة..." : "جاري تحليل أدائك..."}
          </h3>
          <p className="text-slate-500">من فضلك انتظر لحظة واحدة</p>
        </div>
      )}

      {state === AppState.QUIZ && questions.length > 0 && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              السؤال {currentQuestionIdx + 1} من {questions.length}
            </span>
            <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-6">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                {questions[currentQuestionIdx].category === 'logic' && '🧠 منطق'}
                {questions[currentQuestionIdx].category === 'math' && '🔢 رياضيات'}
                {questions[currentQuestionIdx].category === 'verbal' && '📖 لغويات'}
                {questions[currentQuestionIdx].category === 'spatial' && '📐 بصري'}
              </span>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {questions[currentQuestionIdx].text}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestionIdx].options.map((option, idx) => (
                <button
                  key={idx}
                  disabled={showFeedback}
                  onClick={() => handleAnswer(idx)}
                  className={`text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center group relative overflow-hidden ${getOptionStyles(idx)}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ml-4 transition-colors ${
                    showFeedback 
                      ? (idx === questions[currentQuestionIdx].correctAnswerIndex ? 'bg-emerald-600 text-white' : (idx === selectedIdx ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'))
                      : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    {showFeedback && idx === questions[currentQuestionIdx].correctAnswerIndex ? '✓' : String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`font-medium ${showFeedback ? (idx === questions[currentQuestionIdx].correctAnswerIndex ? 'text-emerald-700' : (idx === selectedIdx ? 'text-rose-700' : 'text-slate-400')) : 'text-slate-700'}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {showFeedback && (
            <div className="text-center animate-in fade-in slide-in-from-top-2">
              <p className={`text-sm font-bold ${selectedIdx === questions[currentQuestionIdx].correctAnswerIndex ? 'text-emerald-600' : 'text-rose-600'}`}>
                {selectedIdx === questions[currentQuestionIdx].correctAnswerIndex ? "أحسنت! إجابة صحيحة" : "إجابة غير صحيحة، ركز أكثر"}
              </p>
            </div>
          )}
        </div>
      )}

      {state === AppState.RESULT && finalResult && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-6 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">نتيجتك النهائية</h2>
              <p className="text-slate-500">لقد أتممت الاختبار بنجاح!</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
              <div className="p-6 bg-indigo-50 rounded-2xl flex-1 w-full border border-indigo-100">
                <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">نسبة الإجابة</div>
                <div className="text-4xl font-black text-indigo-600">{finalResult.score} / {finalResult.totalQuestions}</div>
              </div>
              <div className="p-6 bg-slate-900 rounded-2xl flex-1 w-full text-white shadow-xl shadow-slate-200">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">تقدير IQ</div>
                <div className="text-4xl font-black text-white">{finalResult.iqEstimate}</div>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 text-2xl">✨</span>
                تحليل الذكاء الاصطناعي:
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-loose whitespace-pre-wrap text-sm md:text-base border border-slate-100 shadow-inner">
                {finalResult.analysis}
              </div>
            </div>

            <button 
              onClick={reset}
              className="mt-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-8 rounded-xl transition-all"
            >
              إعادة الاختبار مرة أخرى
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
