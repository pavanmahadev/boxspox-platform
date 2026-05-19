"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

interface QuizEngineProps {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
  onComplete?: (score: number, passed: boolean) => void;
}

export function QuizEngine({ quizId, title, questions, passingScore = 70, onComplete }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQuestion.correct_option_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      const finalScorePercentage = Math.round(((score + (selectedOption === currentQuestion.correct_option_index ? 1 : 0)) / questions.length) * 100);
      setIsFinished(true);
      if (onComplete) {
        onComplete(finalScorePercentage, finalScorePercentage >= passingScore);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)]">
        <AlertCircle size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
        <h3 className="text-xl font-bold">No Questions Found</h3>
        <p className="text-[var(--text-secondary)]">This quiz doesn't have any questions configured yet.</p>
      </div>
    );
  }

  if (isFinished) {
    const finalPercentage = Math.round((score / questions.length) * 100);
    const passed = finalPercentage >= passingScore;

    return (
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-8 max-w-2xl mx-auto text-center shadow-lg">
        <div className="mb-6">
          {passed ? (
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={48} className="text-red-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {passed ? "Congratulations! You Passed!" : "Quiz Failed"}
          </h2>
          <p className="text-[var(--text-secondary)]">
            You scored <span className="font-bold text-[var(--text-primary)]">{finalPercentage}%</span>. 
            {passed ? " Great job!" : ` You need at least ${passingScore}% to pass.`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            onClick={resetQuiz}
            className="px-6 py-3 rounded-lg border border-[var(--border-primary)] font-medium flex items-center gap-2 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <RefreshCcw size={18} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header / Progress */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
          <p className="text-[var(--text-tertiary)] text-sm">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 w-8 rounded-full transition-colors ${
                idx < currentIndex ? "bg-[var(--brand-primary)]" : 
                idx === currentIndex ? "bg-[var(--brand-primary)] opacity-50" : 
                "bg-[var(--border-primary)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-6 md:p-8 shadow-sm mb-6"
        >
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-8 leading-relaxed">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correct_option_index === idx;
              
              let styleClasses = "border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-tertiary)]";
              
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  styleClasses = "border-green-500 bg-green-500/10";
                } else if (isSelected && !isCorrect) {
                  styleClasses = "border-red-500 bg-red-500/10";
                } else {
                  styleClasses = "border-[var(--border-primary)] bg-[var(--bg-secondary)] opacity-50";
                }
              } else if (isSelected) {
                styleClasses = "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${styleClasses}`}
                >
                  <span className="text-[var(--text-primary)] font-medium">{option}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle className="text-green-500" size={20} />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswerSubmitted && currentQuestion.explanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm text-[var(--text-secondary)]"
            >
              <span className="font-bold text-[var(--text-primary)] block mb-1">Explanation:</span>
              {currentQuestion.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              selectedOption === null 
                ? "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed" 
                : "bg-[var(--brand-primary)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-8 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
