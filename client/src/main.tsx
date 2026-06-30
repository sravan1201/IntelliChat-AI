import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(26, 26, 39)',
              color: '#e5e7eb',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif'
            },
            success: { iconTheme: { primary: '#0ea5e9', secondary: 'white' } },
            error: { iconTheme: { primary: '#f87171', secondary: 'white' } }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
