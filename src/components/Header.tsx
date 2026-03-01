import { Play } from 'lucide-react';

export function Header() {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Play className="text-white w-5 h-5 fill-current" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">
                        Chess <span className="text-blue-600">Next Move</span>
                    </h1>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">Analysis</a>
                    <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">History</a>
                    <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">Guide</a>
                </nav>
            </div>
        </header>
    );
}
