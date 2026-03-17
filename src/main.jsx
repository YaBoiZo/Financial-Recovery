import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(err) { return { error: err }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 40, fontFamily: 'monospace', color: '#ff5c7a', background: '#0f1117', minHeight: '100vh' }}>
                    <h2 style={{ color: '#fff', marginBottom: 16 }}>App crashed — error details:</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(this.state.error)}</pre>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#94a3b8', marginTop: 16 }}>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
