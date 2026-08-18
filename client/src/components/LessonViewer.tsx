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
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-white/30 mx-auto animate-pulse" />
          <p className="text-white/50">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-white/50">Lesson not found.</p>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 mx-auto text-white/60 hover:text-white text-sm transition-colors"
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
        toast.success("Lesson complete! 🎉");
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.estimatedMinutes} min
            </span>
            <span className="px-2 py-0.5 rounded-full border border-white/20 text-xs text-white/60">
              {lesson.category}
            </span>
            {quizPassed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 text-xs font-medium border border-green-600/30">
                <Trophy className="w-3 h-3" /> Passed ({bestScore}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {viewState === "lesson" && totalSteps > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/40">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[oklch(0.5_0.2_25)] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── LESSON CONTENT ── */}
      {viewState === "lesson" && steps.length > 0 && (
        <div className="bg-[oklch(0.13_0.01_260)] border border-white/10 rounded-2xl overflow-hidden">
          {/* Step nav pills */}
          <div className="flex gap-1 p-4 border-b border-white/10 overflow-x-auto">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  idx === currentStep
                    ? "bg-[oklch(0.5_0.2_25)] text-white shadow"
                    : idx < completedStepsCount
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
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
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">{steps[currentStep].title}</h2>
            <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
              {steps[currentStep].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/3">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
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
          <div className="bg-[oklch(0.13_0.01_260)] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[oklch(0.5_0.2_25_/_15%)] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[oklch(0.65_0.2_25)]" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-white">Knowledge Check</h2>
                <p className="text-sm text-white/50">
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
                    <p className="font-medium text-white">
                      <span className="text-white/40 mr-2">{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="grid gap-2">
                      {opts.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                            selected === optIdx
                              ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25_/_15%)] text-white font-medium"
                              : "border-white/15 text-white/80 hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-semibold mr-2 text-white/40">
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

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setViewState("lesson")}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Review Lesson
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {viewState === "results" && quizResult && (
        <div className="bg-[oklch(0.13_0.01_260)] border border-white/10 rounded-2xl p-8 text-center space-y-6">
          {quizResult.passed ? (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-400">You Passed!</h2>
              <p className="text-white/60">
                Great work — you scored {quizResult.score}% ({quizResult.correct}/{quizResult.total} correct)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Not quite</h2>
              <p className="text-white/60">
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
                      ? "border-green-600/30 bg-green-600/5"
                      : "border-red-600/30 bg-red-600/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-red-400">
                          Your answer: {String.fromCharCode(65 + yourAnswer)}. {opts[yourAnswer]}
                        </p>
                      )}
                      <p className="text-green-400">
                        Correct: {String.fromCharCode(65 + correctIdx)}. {opts[correctIdx]}
                      </p>
                      {res?.explanation && (
                        <p className="text-white/50 italic">{res.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {!quizResult.passed && (
              <button
                onClick={handleRetakeQuiz}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
            )}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
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
