import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Homepage from './components/homepage'
import Article from './UI/article'
import AdminDashboard from './pages/AdminDashboard'
import ArticleEditor from './pages/ArticleEditor'
import AdminLogin from './pages/AdminLogin'
import Layout from './components/layout'
import ProtectedRoute from './components/ProtectedRoute'

const AdminRedirect = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        if (code === "jean0703676436") {
            navigate("/login");
        } else {
            navigate("/");
        }
    }, [code, navigate]);
    return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />} >
          <Route path="/" element={<Homepage />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/app/:code" element={<AdminRedirect />} />
          
          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<AdminDashboard />} />
             <Route path="/admin/new-post" element={<ArticleEditor />} />
             <Route path="/admin/edit/:id" element={<ArticleEditor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
