import React from 'react';
import { User } from 'lucide-react';

interface ExamHeaderProps {
  examName: string;
  timeLeftSeconds: number;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ examName, timeLeftSeconds }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border-b border-gray-300 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="font-bold text-lg text-gray-800 truncate max-w-[50%]">
        {examName}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-4">
          <span className="text-xs text-gray-500">Time Remaining</span>
          <span className="text-xl font-mono font-bold text-black bg-gray-100 px-2 rounded border border-gray-300">
            {formatTime(timeLeftSeconds)}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
                <div className="text-sm font-semibold">Candidate Name</div>
                <div className="text-xs text-gray-500">Subject: Computer Science</div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                <User className="text-gray-500" size={24} />
            </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;