import { Outlet } from "react-router-dom"
import Navbar from "../UI/navbar"
import Footer from "../UI/footer"
import { CategoryProvider } from "../utils/CategoryContext"

const Layout = () => {
    return (
        <CategoryProvider>
            <Navbar />
            <Outlet />
            <Footer />
        </CategoryProvider>
    )
}
export default Layout
