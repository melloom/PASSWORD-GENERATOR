import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-3">Something went wrong</h2>
          <p className="mb-4">The application encountered an error and couldn't continue.</p>
          <details className="text-left mb-4 p-3 bg-gray-100 rounded-lg overflow-auto max-h-64">
            <summary className="font-medium cursor-pointer mb-2">Error details</summary>
            <p className="mb-2 text-red-500">{this.state.error?.toString()}</p>
            <pre className="text-xs whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
