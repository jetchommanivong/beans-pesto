import { Dog, Lightbulb, PawPrint } from 'lucide-react'
import AppLayout from '../components/AppLayout.jsx'
import './LoadingScreen.css'

export default function LoadingScreen({ progress }) {
  return (
    <AppLayout showNav={false}>
      <div className="loading">
        <div className="loading__art" aria-hidden="true">
          <Dog size={80} strokeWidth={1.5} />
        </div>

        <div className="loading__status">
          <PawPrint size={20} aria-hidden="true" />
          Loading…
        </div>
        <div
          className="loading__bar"
          role="progressbar"
          aria-label="Loading Tail Mates"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="loading__fill" style={{ width: `${progress}%` }} />
        </div>

        <aside className="loading__tip">
          <Lightbulb size={22} aria-hidden="true" />
          <p>
            <strong>Tip:</strong> On warm days, look for water stops on the map before you head
            out.
          </p>
        </aside>
      </div>
    </AppLayout>
  )
}
