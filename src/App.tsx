import Admin from './pages/Admin'
import Display from './pages/Display'

// "/" = display TV (publik). "/admin" = dashboard admin (wajib login).
export default function App() {
  return location.pathname.startsWith('/admin') ? <Admin /> : <Display />
}
