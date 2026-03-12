import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's the insertBefore error
    if (error?.message?.includes('insertBefore') || 
        error?.message?.includes('removeChild')) {
      // Suppress this specific error silently
      return { hasError: false };
    }
    // For other errors, show them
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log insertBefore errors but don't show to user
    if (error?.message?.includes('insertBefore') || 
        error?.message?.includes('removeChild')) {
      console.warn('Suppressed Framer Motion DOM error:', error.message);
      // Reset error state immediately
      this.setState({ hasError: false });
      return;
    }
    
    // Log other errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for real errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Algo correu mal</h2>
            <p className="text-gray-600 mb-4">Por favor, recarregue a página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1a2342] text-white rounded-lg hover:bg-[#0f1529]"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
