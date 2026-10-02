import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>Hello World from React!</h1>
      <p>Built with Vite, served by nginx in a Docker container.</p>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
    </main>
  )
}

export default App
