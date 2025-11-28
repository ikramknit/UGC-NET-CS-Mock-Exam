import React from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface WelcomeScreenProps {
  onStartExam: () => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartExam, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-blue-600 p-4 text-white text-center">
          <h1 className="text-2xl font-bold">UGC NET Computer Science & Applications</h1>
          <p className="opacity-90">Mock Test - Computer Based Test (CBT) Mode</p>
        </div>

        <div className="p-8 h-[60vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">General Instructions:</h2>
          
          <div className="space-y-4 text-gray-700 text-sm md:text-base">
            <p>1. The clock has been set at the server and the countdown timer at the top right corner of your screen will display the time remaining for you to complete the exam.</p>
            
            <p>2. The question palette at the right of screen shows one of the following statuses of each of the questions numbered:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 pl-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-200 border border-gray-300 rounded text-xs font-bold">1</span>
                <span>You have not visited the question yet.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded text-xs font-bold clip-path-polygon">3</span>
                <span>You have not answered the question.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded text-xs font-bold">5</span>
                <span>You have answered the question.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full text-xs font-bold">7</span>
                <span>You have NOT answered the question, but have marked the question for review.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full text-xs font-bold">
                  9
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </div>
                <span className="leading-tight">The question(s) "Answered and Marked for Review" will be considered for evaluation.</span>
              </div>
            </div>

            <p>3. You can click on the ">" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window.</p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <h3 className="font-bold flex items-center gap-2 text-yellow-800">
                <AlertTriangle size={18} />
                Note:
              </h3>
              <p className="text-yellow-800 text-sm">
                This mock test consists of generated questions based on Previous Year Question trends. 
                The interface is designed to replicate the actual NTA interface for practice purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <input type="checkbox" id="conf" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="conf" className="text-sm cursor-pointer select-none">
                    I have read and understood the instructions.
                </label>
            </div>
          <button
            onClick={onStartExam}
            disabled={isLoading}
            className={`px-8 py-3 rounded font-bold text-white transition-all
              ${isLoading 
                ? 'bg-gray-400 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl active:transform active:scale-95'
              }`}
          >
            {isLoading ? 'Preparing Exam...' : 'I am ready to begin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;