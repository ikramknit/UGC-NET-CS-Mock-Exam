import React from 'react';
import { ExamState, Question, QuestionStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultScreenProps {
  examState: ExamState;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ examState, onRestart }) => {
  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    examState.questions.forEach(q => {
      const response = examState.responses[q.id];
      // Considered attempted if ANSWERED or ANSWERED_AND_MARKED
      const isAttempted = response.status === QuestionStatus.ANSWERED || response.status === QuestionStatus.ANSWERED_AND_MARKED;
      
      if (isAttempted && response.selectedOptionIndex !== null) {
        if (response.selectedOptionIndex === q.correctAnswerIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    });

    return { correct, incorrect, unattempted, total: examState.questions.length };
  };

  const results = calculateScore();
  const percentage = Math.round((results.correct / results.total) * 100);

  const data = [
    { name: 'Correct', value: results.correct, color: '#22c55e' },
    { name: 'Incorrect', value: results.incorrect, color: '#ef4444' },
    { name: 'Unattempted', value: results.unattempted, color: '#94a3b8' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">Exam Result Summary</h1>
        
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-green-500">
            <div className="text-4xl font-bold text-green-600">{results.correct * 2}</div>
            <div className="text-gray-500 uppercase text-xs tracking-wider mt-1">Score Obtained</div>
          </div>
           <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-blue-500">
            <div className="text-4xl font-bold text-gray-800">{percentage}%</div>
            <div className="text-gray-500 uppercase text-xs tracking-wider mt-1">Percentage</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-green-400">
            <div className="text-4xl font-bold text-green-500">{results.correct}</div>
            <div className="text-gray-500 uppercase text-xs tracking-wider mt-1">Correct Answers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-400">
            <div className="text-4xl font-bold text-red-500">{results.incorrect}</div>
            <div className="text-gray-500 uppercase text-xs tracking-wider mt-1">Incorrect Answers</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow-md h-80 flex flex-col md:flex-row items-center justify-center">
             <div className="w-full h-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="md:w-1/2 text-center md:text-left mt-4 md:mt-0 p-4">
                <h3 className="text-xl font-bold mb-2">Performance Analysis</h3>
                <p className="text-gray-600">
                    {percentage >= 60 
                        ? "Excellent work! You have a good grasp of the core concepts." 
                        : percentage >= 40 
                        ? "Good effort. Review the incorrect answers to improve your score." 
                        : "Keep practicing. Focus on the topics where you faced difficulty."}
                </p>
             </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white p-4 font-bold">Question Wise Analysis</div>
            <div className="divide-y divide-gray-200">
                {examState.questions.map((q, idx) => {
                    const response = examState.responses[q.id];
                    const isCorrect = response.selectedOptionIndex === q.correctAnswerIndex;
                    const userSelected = response.selectedOptionIndex !== null ? q.options[response.selectedOptionIndex] : "Not Attempted";
                    
                    return (
                        <div key={q.id} className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-700">Q{idx + 1}. {q.text}</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {isCorrect ? 'Correct' : 'Incorrect/Skipped'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                <div className={`p-3 rounded border ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Your Answer</span>
                                    <span className="font-medium">{userSelected}</span>
                                </div>
                                <div className="p-3 rounded border border-blue-300 bg-blue-50">
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Correct Answer</span>
                                    <span className="font-medium">{q.options[q.correctAnswerIndex]}</span>
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-gray-700">
                                <span className="font-bold text-gray-900">Explanation: </span>
                                {q.explanation}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="flex justify-center pb-8">
            <button 
                onClick={onRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
                Start New Mock Test
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;