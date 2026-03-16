import { Outlet } from "react-router-dom"
import Navbar from "../UI/navbar"
import Footer from "../UI/footer"

const Layout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    )
}
export default Layout
