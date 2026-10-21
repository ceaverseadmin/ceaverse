import { RouterProvider } from 'react-router-dom'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'
import { router } from './router'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <PwaUpdatePrompt />
    </>
  )
}
