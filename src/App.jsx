import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './components/homepage'
import Article from './UI/article'
import AdminDashboard from './pages/AdminDashboard'
import ArticleEditor from './pages/ArticleEditor'
import Layout from './components/layout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />} >
          <Route path="/" element={<Homepage />} />
          <Route path="/article/:id" element={<Article />} />
          
          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute isAdminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/new-post" element={<ArticleEditor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
