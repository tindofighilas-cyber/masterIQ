
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">اختبار الذكاء العبقري</h1>
        </div>
        <div className="text-slate-500 text-sm font-medium hidden sm:block">
          مدعوم بالذكاء الاصطناعي • النسخة 1.0
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        {children}
      </main>

      <footer className="mt-auto py-8 text-slate-400 text-xs">
        © {new Date().getFullYear()} اختبار الذكاء العبقري. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};
