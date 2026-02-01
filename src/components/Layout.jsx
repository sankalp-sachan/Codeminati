import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ hideFooter = false }) => {
    return (
        <>
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
        </>
    );
};

export default Layout;
