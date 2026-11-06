import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
  XCircle,
  BookOpen,
  Clock,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface LessonViewerProps {
  lessonId: number;
  onBack: () => void;
}

type ViewState = "lesson" | "quiz" | "results";

interface QuizResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  results: Array<{
    questionId: number;
    correct: boolean;
    correctIndex: number;
    explanation: string | null;
  }>;
}

export default function LessonViewer({ lessonId, onBack }: LessonViewerProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewState, setViewState] = useState<ViewState>("lesson");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = trpc.learning.getLesson.useQuery({ lessonId });
  const { data: myProgress } = trpc.learning.getMyProgress.useQuery(undefined, {
    enabled: !!user,
  });

  const completeStepMut = trpc.learning.completeStep.useMutation();
  const submitQuizMut = trpc.learning.submitQuiz.useMutation();
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-900">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
          <p className="text-slate-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-slate-900">
        <p className="text-slate-600">Lesson not found.</p>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 mx-auto rounded-lg text-slate-600 hover:text-blue-700 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    );
  }

  const { lesson, steps, questions } = data;
  const progress = myProgress?.find((p) => p.lessonId === lessonId);
  const completedStepsCount = progress?.completedSteps ?? 0;
  const quizPassed = (progress?.quizPassed ?? 0) === 1;
  const bestScore = progress?.bestScore ?? 0;

  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  // ─── Lesson view ───────────────────────────────────────────────────────────
  const handleNextStep = async () => {
    if (!user) {
      toast.info("Log in to track your progress");
    } else {
      try {
        await completeStepMut.mutateAsync({
          lessonId,
          stepNumber: currentStep + 1,
          totalSteps,
        });
        utils.learning.getMyProgress.invalidate();
      } catch {
        // Non-blocking
      }
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      if (questions.length > 0) {
        setViewState("quiz");
      } else {
        toast.success("Lesson complete!");
        onBack();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  // ─── Quiz view ─────────────────────────────────────────────────────────────
  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  const handleSubmitQuiz = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a quiz");
      return;
    }
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id],
      }));
      const result = await submitQuizMut.mutateAsync({ lessonId, answers });
      setQuizResult(result);
      setViewState("results");
      utils.learning.getMyProgress.invalidate();
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setViewState("quiz");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <button
          onClick={onBack}
          className="flex shrink-0 items-center gap-1.5 text-slate-600 hover:text-blue-700 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 basis-48 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 break-words">{lesson.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.estimatedMinutes} min
            </span>
            <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 break-words">
              {lesson.category}
            </span>
            {quizPassed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                <Trophy className="w-3 h-3" /> Passed ({bestScore}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {viewState === "lesson" && totalSteps > 0 && (
        <div className="space-y-1">
          <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-600">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── LESSON CONTENT ── */}
      {viewState === "lesson" && steps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Step nav pills */}
          <div className="flex gap-1 p-4 border-b border-slate-200 overflow-x-auto">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  idx === currentStep
                    ? "bg-blue-600 text-white shadow-sm"
                    : idx < completedStepsCount
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {idx < completedStepsCount ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span>{idx + 1}</span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="p-5 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 break-words">{steps[currentStep].title}</h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-sm">
              {steps[currentStep].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-400 text-sm font-medium transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {currentStep < totalSteps - 1 ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : questions.length > 0 ? (
                <>Take Quiz <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Complete <CheckCircle2 className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {viewState === "quiz" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-lg text-slate-900 break-words">Knowledge Check</h2>
                <p className="text-sm text-slate-600">
                  {questions.length} questions — score 70% or higher to pass
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {questions.map((q, qIdx) => {
                const opts: string[] = JSON.parse(q.options);
                const selected = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="space-y-3">
                    <p className="font-medium text-slate-900 break-words">
                      <span className="text-slate-500 mr-2">{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="grid gap-2">
                      {opts.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm break-words transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                            selected === optIdx
                              ? "border-blue-600 bg-blue-50 text-blue-900 font-medium"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-semibold mr-2 text-slate-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setViewState("lesson")}
                className="flex items-center gap-1.5 rounded-lg text-slate-600 hover:text-blue-700 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4" /> Review Lesson
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm disabled:bg-blue-200 disabled:text-slate-600 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {viewState === "results" && quizResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 text-center space-y-6 shadow-sm">
          {quizResult.passed ? (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-green-700" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">You Passed!</h2>
              <p className="text-slate-600">
                Great work — you scored {quizResult.score}% ({quizResult.correct}/{quizResult.total} correct)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Not quite</h2>
              <p className="text-slate-600">
                You scored {quizResult.score}% ({quizResult.correct}/{quizResult.total} correct). You need 70% to pass.
              </p>
            </div>
          )}

          {/* Per-question breakdown */}
          <div className="text-left space-y-4 mt-4">
            {questions.map((q, qIdx) => {
              const opts: string[] = JSON.parse(q.options);
              const res = quizResult.results.find((r) => r.questionId === q.id);
              const isCorrect = res?.correct ?? false;
              const correctIdx = res?.correctIndex ?? q.correctIndex;
              const yourAnswer = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 space-y-1 text-sm break-words">
                      <p className="font-medium text-slate-900">
                        {qIdx + 1}. {q.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-red-700">
                          Your answer: {String.fromCharCode(65 + yourAnswer)}. {opts[yourAnswer]}
                        </p>
                      )}
                      <p className="text-green-700">
                        Correct: {String.fromCharCode(65 + correctIdx)}. {opts[correctIdx]}
                      </p>
                      {res?.explanation && (
                        <p className="text-slate-600 italic">{res.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!quizResult.passed && (
              <button
                onClick={handleRetakeQuiz}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-400 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
            )}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {quizResult.passed ? (
                <><Trophy className="w-4 h-4" /> Back to Lessons</>
              ) : (
                <><ArrowLeft className="w-4 h-4" /> Back to Lessons</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
