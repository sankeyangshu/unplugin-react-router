import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <h1>Hello World</h1>
    </Suspense>
  );
}

const app = createRoot(document.getElementById('root')!);

app.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
