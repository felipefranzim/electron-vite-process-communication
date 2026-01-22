import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App'
import { CapturaFoto } from './pages/CapturaFoto'
import SecondaryWindowLayout from './layouts/SecondaryWindowLayout'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route element={<SecondaryWindowLayout />}>
                    <Route path="/capture-photo" element={<CapturaFoto />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
