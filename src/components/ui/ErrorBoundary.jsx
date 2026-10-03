import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-center shadow-xs my-4 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {this.props.title || 'حدث خطأ غير متوقع في هذا الجزء'}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
            {this.props.message ||
              'تعذر تحميل هذه البيانات بشكل سليم. يمكنك محاولة إعادة التحميل دون التأثير على بقية الشاشة.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 text-xs text-rose-700 border-rose-300 hover:bg-rose-100/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
