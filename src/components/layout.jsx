import { Outlet } from "react-router-dom"
import Navbar from "../UI/navbar"
import Footer from "../UI/footer"
import BreakingTicker from "../UI/BreakingTicker"
import { CategoryProvider } from "../utils/CategoryContext"

const Layout = () => {
    return (
        <CategoryProvider>
            <BreakingTicker />
            <Navbar />
            <Outlet />
            <Footer />
        </CategoryProvider>
    )
}
export default Layout
