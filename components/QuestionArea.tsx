import React from 'react';
import { Question } from '../types';

interface QuestionAreaProps {
  question: Question;
  selectedOptionIndex: number | null;
  onOptionSelect: (index: number) => void;
  questionNumber: number;
}

const QuestionArea: React.FC<QuestionAreaProps> = ({
  question,
  selectedOptionIndex,
  onOptionSelect,
  questionNumber,
}) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Question Header Line */}
      <div className="border-b border-gray-300 p-2 bg-white sticky top-0 z-10 flex justify-between items-center">
        <h3 className="font-bold text-lg text-blue-800">Question {questionNumber}:</h3>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">View in:</span>
            <select className="border border-gray-300 rounded px-1 text-sm bg-gray-50">
                <option>English</option>
            </select>
            <span className="text-xs font-bold text-red-600 ml-2">+2.00 / -0.00</span>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1">
        <div className="mb-6 text-gray-900 text-base md:text-lg leading-relaxed font-medium">
          {question.text}
        </div>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <label
              key={idx}
              className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors
                ${selectedOptionIndex === idx 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="pt-0.5">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={selectedOptionIndex === idx}
                  onChange={() => onOptionSelect(idx)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
              </div>
              <span className="text-gray-800">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionArea;