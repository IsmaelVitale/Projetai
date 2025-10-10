import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. Importe o BrowserRouter
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    // <<< CORREÇÃO AQUI: Removendo o React.StrictMode
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
