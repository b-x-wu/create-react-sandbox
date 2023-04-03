import React from 'react'
import { createRoot } from 'react-dom/client'

const App = () => {
    return (
        <>
            This is a React App! Modify src/index.jsx to get started.
        </>
    )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
