import React from 'react';
import { QuestionStatus, UserResponse, Question } from '../types';

interface QuestionPaletteProps {
  questions: Question[];
  responses: Record<number, UserResponse>;
  currentQuestionId: number;
  onQuestionClick: (index: number) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  responses,
  currentQuestionId,
  onQuestionClick,
  isCollapsed,
  toggleCollapse
}) => {
  const getStatusClass = (qId: number) => {
    const response = responses[qId];
    // Default to NOT_VISITED if no response object exists yet (though we initialize them)
    const status = response ? response.status : QuestionStatus.NOT_VISITED;

    switch (status) {
      case QuestionStatus.ANSWERED:
        return 'bg-green-500 text-white clip-path-custom'; // Custom shape simulation via standard css for now
      case QuestionStatus.NOT_ANSWERED:
        return 'bg-red-500 text-white clip-path-custom-2';
      case QuestionStatus.MARKED_FOR_REVIEW:
        return 'bg-purple-600 text-white rounded-full';
      case QuestionStatus.ANSWERED_AND_MARKED:
        // Complex shape: Purple with small green dot. We'll simulate with pseudo-element or inner span logic in render
        return 'bg-purple-600 text-white rounded-full relative';
      case QuestionStatus.NOT_VISITED:
      default:
        return 'bg-gray-200 text-black border border-gray-300 rounded';
    }
  };

  const allResponses = Object.values(responses) as UserResponse[];

  const stats = {
    answered: allResponses.filter(r => r.status === QuestionStatus.ANSWERED).length,
    notAnswered: allResponses.filter(r => r.status === QuestionStatus.NOT_ANSWERED).length,
    notVisited: allResponses.filter(r => r.status === QuestionStatus.NOT_VISITED).length,
    marked: allResponses.filter(r => r.status === QuestionStatus.MARKED_FOR_REVIEW).length,
    markedAnswered: allResponses.filter(r => r.status === QuestionStatus.ANSWERED_AND_MARKED).length,
  };

  if (isCollapsed) {
    return (
      <div className="w-8 bg-gray-100 border-l border-gray-300 flex flex-col items-center py-2 h-full z-10">
        <button 
          onClick={toggleCollapse} 
          className="bg-blue-500 text-white w-6 h-12 flex items-center justify-center rounded-l mb-2 hover:bg-blue-600"
          title="Expand Palette"
        >
          &lt;
        </button>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 bg-blue-50 flex flex-col h-full border-l border-gray-300 shadow-xl z-10 transition-all duration-300 ease-in-out absolute md:relative right-0 top-0 bottom-0">
      <div className="p-2 bg-gray-200 border-b border-gray-300 flex justify-between items-center">
         <span className="font-bold text-sm">Question Palette</span>
         <button onClick={toggleCollapse} className="text-gray-500 hover:text-black md:hidden">Close</button>
      </div>

      {/* Legend */}
      <div className="p-3 bg-white border-b border-gray-200 grid grid-cols-2 gap-2 text-xs">
         <div className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded"></span> {stats.answered} Answered</div>
         <div className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded"></span> {stats.notAnswered} Not Answered</div>
         <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></span> {stats.notVisited} Not Visited</div>
         <div className="flex items-center gap-1"><span className="w-4 h-4 bg-purple-600 rounded-full"></span> {stats.marked} Marked</div>
         <div className="flex items-center gap-1 col-span-2"><span className="w-4 h-4 bg-purple-600 rounded-full relative"><span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full"></span></span> {stats.markedAnswered} Answered & Marked</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-blue-50">
        <div className="font-bold text-gray-700 mb-2">Section: Computer Science</div>
        <div className="grid grid-cols-4 gap-3">
          {questions.map((q, idx) => {
             const status = responses[q.id]?.status;
             const isCurrent = q.id === currentQuestionId;
             const baseClass = getStatusClass(q.id);
             
             return (
              <button
                key={q.id}
                onClick={() => onQuestionClick(idx)}
                className={`
                  w-10 h-10 flex items-center justify-center font-bold text-sm transition-transform hover:scale-105
                  ${baseClass}
                  ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                `}
              >
                {idx + 1}
                {status === QuestionStatus.ANSWERED_AND_MARKED && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white translate-x-1 translate-y-1"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-3 bg-white border-t border-gray-300 text-center">
         <p className="text-xs text-gray-500">Legend matches NTA standard.</p>
      </div>
    </div>
  );
};

export default QuestionPalette;