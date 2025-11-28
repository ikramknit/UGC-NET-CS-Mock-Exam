import React, { useState, useEffect, useCallback } from 'react';
import { generateExamQuestions } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import ExamHeader from './components/ExamHeader';
import QuestionArea from './components/QuestionArea';
import QuestionPalette from './components/QuestionPalette';
import ResultScreen from './components/ResultScreen';
import { ExamState, Question, QuestionStatus, UserResponse } from './types';
import { Loader2 } from 'lucide-react';

const TOTAL_QUESTIONS = 20;
const EXAM_DURATION_SECONDS = 20 * 60; // 20 minutes

const App: React.FC = () => {
  const [examState, setExamState] = useState<ExamState>({
    questions: [],
    responses: {},
    currentQuestionIndex: 0,
    timeLeftSeconds: EXAM_DURATION_SECONDS,
    isExamActive: false,
    isSubmitted: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(true);

  // Timer Effect
  useEffect(() => {
    let timer: number;
    if (examState.isExamActive && !examState.isSubmitted && examState.timeLeftSeconds > 0) {
      timer = window.setInterval(() => {
        setExamState(prev => {
          if (prev.timeLeftSeconds <= 1) {
            handleSubmitExam();
            return { ...prev, timeLeftSeconds: 0 };
          }
          return { ...prev, timeLeftSeconds: prev.timeLeftSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examState.isExamActive, examState.isSubmitted]);

  const initExam = async () => {
    setIsLoading(true);
    try {
      const questions = await generateExamQuestions(TOTAL_QUESTIONS);
      
      const initialResponses: Record<number, UserResponse> = {};
      questions.forEach(q => {
        initialResponses[q.id] = {
          questionId: q.id,
          selectedOptionIndex: null,
          status: QuestionStatus.NOT_VISITED
        };
      });

      // Mark first question as Not Answered (standard NTA behavior when exam starts)
      if(initialResponses[questions[0].id]) {
        initialResponses[questions[0].id].status = QuestionStatus.NOT_ANSWERED;
      }

      setExamState({
        questions,
        responses: initialResponses,
        currentQuestionIndex: 0,
        timeLeftSeconds: EXAM_DURATION_SECONDS,
        isExamActive: true,
        isSubmitted: false
      });
    } catch (err) {
      console.error("Error starting exam:", err);
      alert("Failed to generate exam. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    const currentQ = examState.questions[examState.currentQuestionIndex];
    setExamState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQ.id]: {
          ...prev.responses[currentQ.id],
          selectedOptionIndex: idx
          // Note: We don't change status to ANSWERED yet, only on "Save & Next"
        }
      }
    }));
  };

  const handleQuestionNavigation = (index: number) => {
    // When moving to another question without saving, if the current was NOT_VISITED, it becomes NOT_ANSWERED
    // If it was already ANSWERED or MARKED, it stays as is.
    updateCurrentQuestionStatusOnLeave(examState.currentQuestionIndex, index);
  };

  const updateCurrentQuestionStatusOnLeave = (currentIndex: number, nextIndex: number) => {
    const currentQ = examState.questions[currentIndex];
    const currentResponse = examState.responses[currentQ.id];
    
    let newStatus = currentResponse.status;

    if (currentResponse.status === QuestionStatus.NOT_VISITED) {
        newStatus = QuestionStatus.NOT_ANSWERED;
    }

    setExamState(prev => {
        // Also ensure the target question is marked as at least NOT_ANSWERED if it was NOT_VISITED
        const nextQ = prev.questions[nextIndex];
        const nextResponse = prev.responses[nextQ.id];
        let nextStatus = nextResponse.status;
        if (nextStatus === QuestionStatus.NOT_VISITED) {
            nextStatus = QuestionStatus.NOT_ANSWERED;
        }

        return {
            ...prev,
            currentQuestionIndex: nextIndex,
            responses: {
                ...prev.responses,
                [currentQ.id]: { ...currentResponse, status: newStatus },
                [nextQ.id]: { ...nextResponse, status: nextStatus }
            }
        };
    });
  };

  const handleSaveAndNext = () => {
    const currentQ = examState.questions[examState.currentQuestionIndex];
    const currentResponse = examState.responses[currentQ.id];

    let newStatus = QuestionStatus.NOT_ANSWERED;
    if (currentResponse.selectedOptionIndex !== null) {
      newStatus = QuestionStatus.ANSWERED;
    }

    setExamState(prev => {
        const nextIndex = (prev.currentQuestionIndex + 1) < prev.questions.length ? prev.currentQuestionIndex + 1 : prev.currentQuestionIndex;
        
        // Handle logic for next question status
        const nextQ = prev.questions[nextIndex];
        const nextResponse = prev.responses[nextQ.id];
        let nextStatus = nextResponse.status;
        if(nextStatus === QuestionStatus.NOT_VISITED) nextStatus = QuestionStatus.NOT_ANSWERED;

        return {
            ...prev,
            currentQuestionIndex: nextIndex,
            responses: {
                ...prev.responses,
                [currentQ.id]: { ...currentResponse, status: newStatus },
                [nextQ.id]: { ...nextResponse, status: nextStatus }
            }
        };
    });
  };

  const handleSaveAndMarkForReview = () => {
    const currentQ = examState.questions[examState.currentQuestionIndex];
    const currentResponse = examState.responses[currentQ.id];

    let newStatus = QuestionStatus.MARKED_FOR_REVIEW;
    if (currentResponse.selectedOptionIndex !== null) {
      newStatus = QuestionStatus.ANSWERED_AND_MARKED;
    }

    setExamState(prev => {
        const nextIndex = (prev.currentQuestionIndex + 1) < prev.questions.length ? prev.currentQuestionIndex + 1 : prev.currentQuestionIndex;
         const nextQ = prev.questions[nextIndex];
        const nextResponse = prev.responses[nextQ.id];
        let nextStatus = nextResponse.status;
        if(nextStatus === QuestionStatus.NOT_VISITED) nextStatus = QuestionStatus.NOT_ANSWERED;

        return {
            ...prev,
            currentQuestionIndex: nextIndex,
            responses: {
                ...prev.responses,
                [currentQ.id]: { ...currentResponse, status: newStatus },
                [nextQ.id]: { ...nextResponse, status: nextStatus }
            }
        };
    });
  };

  const handleClearResponse = () => {
    const currentQ = examState.questions[examState.currentQuestionIndex];
    setExamState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQ.id]: {
          ...prev.responses[currentQ.id],
          selectedOptionIndex: null,
          status: QuestionStatus.NOT_ANSWERED
        }
      }
    }));
  };

  const handleMarkForReviewAndNext = () => {
     // Mark for review without saving answer (unless answer is there, then it becomes Answered & Marked, but typically Mark For Review implies checking later)
     // NTA logic: If answer selected + Mark for Review -> Answered & Marked. If no answer + Mark -> Marked.
     const currentQ = examState.questions[examState.currentQuestionIndex];
     const currentResponse = examState.responses[currentQ.id];
     
     let newStatus = QuestionStatus.MARKED_FOR_REVIEW;
     if (currentResponse.selectedOptionIndex !== null) {
        newStatus = QuestionStatus.ANSWERED_AND_MARKED;
     }

     setExamState(prev => {
        const nextIndex = (prev.currentQuestionIndex + 1) < prev.questions.length ? prev.currentQuestionIndex + 1 : prev.currentQuestionIndex;
         const nextQ = prev.questions[nextIndex];
        const nextResponse = prev.responses[nextQ.id];
        let nextStatus = nextResponse.status;
        if(nextStatus === QuestionStatus.NOT_VISITED) nextStatus = QuestionStatus.NOT_ANSWERED;

        return {
            ...prev,
            currentQuestionIndex: nextIndex,
            responses: {
                ...prev.responses,
                [currentQ.id]: { ...currentResponse, status: newStatus },
                [nextQ.id]: { ...nextResponse, status: nextStatus }
            }
        };
    });
  };

  const handleSubmitExam = () => {
    setExamState(prev => ({ ...prev, isSubmitted: true, isExamActive: false }));
  };

  const handleRestart = () => {
    setExamState({
      questions: [],
      responses: {},
      currentQuestionIndex: 0,
      timeLeftSeconds: EXAM_DURATION_SECONDS,
      isExamActive: false,
      isSubmitted: false
    });
  };

  if (!examState.isExamActive && !examState.isSubmitted) {
    return <WelcomeScreen onStartExam={initExam} isLoading={isLoading} />;
  }

  if (examState.isSubmitted) {
    return <ResultScreen examState={examState} onRestart={handleRestart} />;
  }

  const currentQ = examState.questions[examState.currentQuestionIndex];
  const currentResponse = examState.responses[currentQ.id];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ExamHeader examName="UGC NET - Computer Science & Applications" timeLeftSeconds={examState.timeLeftSeconds} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Question Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showPalette ? 'mr-0 md:mr-80' : 'mr-0'}`}>
          <div className="flex-1 overflow-auto">
             {currentQ && (
                <QuestionArea 
                    question={currentQ}
                    selectedOptionIndex={currentResponse?.selectedOptionIndex ?? null}
                    onOptionSelect={handleOptionSelect}
                    questionNumber={examState.currentQuestionIndex + 1}
                />
             )}
          </div>
          
          {/* Footer Navigation Buttons (Sticky Bottom) */}
          <div className="bg-white border-t border-gray-300 p-2 md:p-3 flex flex-wrap gap-2 justify-between items-center z-20 shadow-lg">
             <div className="flex gap-2">
                <button 
                    onClick={handleSaveAndMarkForReview}
                    className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs md:text-sm font-medium flex items-center gap-1"
                >
                   <span className="w-2 h-2 rounded-full bg-purple-600"></span> Save & Mark for Review
                </button>
                <button 
                    onClick={handleClearResponse}
                    className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs md:text-sm font-medium"
                >
                    Clear Response
                </button>
                <button 
                    onClick={handleMarkForReviewAndNext}
                    className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs md:text-sm font-medium flex items-center gap-1"
                >
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span> Mark for Review & Next
                </button>
             </div>
             
             <div>
                <button 
                    onClick={handleSaveAndNext}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold text-sm md:text-base shadow-sm"
                >
                    Save & Next
                </button>
             </div>
          </div>
           {/* Submit Button (Absolute bottom right usually, but sticking to nav for cleaner mobile) */}
           <div className="absolute bottom-[4.5rem] left-4">
              <button 
                  onClick={() => {
                      if(window.confirm("Are you sure you want to submit the exam?")) {
                          handleSubmitExam();
                      }
                  }}
                  className="px-4 py-1 bg-green-600 text-white text-xs font-bold rounded shadow hover:bg-green-700 opacity-90"
              >
                  Submit Exam
              </button>
           </div>
        </div>

        {/* Right Palette */}
        <QuestionPalette 
            questions={examState.questions}
            responses={examState.responses}
            currentQuestionId={currentQ.id}
            onQuestionClick={handleQuestionNavigation}
            isCollapsed={!showPalette}
            toggleCollapse={() => setShowPalette(!showPalette)}
        />
      </div>
    </div>
  );
};

export default App;