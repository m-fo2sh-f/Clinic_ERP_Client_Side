import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('⚠️ Caught React Component Error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 m-4 bg-slate-900 border border-red-500/30 rounded-2xl text-center shadow-xl space-y-4 font-sans">
                    <div className="inline-flex p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">حدث خطأ غير متوقع في هذه الشاشة</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            عذراً، تعذر تحميل هذا الجزء من الصفحة بشكل صحيح. يمكنك المحاولة مرة أخرى دون التأثير على باقي النظام.
                        </p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="px-4 py-2.5 bg-clinic-600 hover:bg-clinic-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-clinic-600/20 inline-flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>إعادة تحميل الصفحة</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;