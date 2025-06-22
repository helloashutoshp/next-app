import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsAuthenticated(!!Cookies.get("authToken"));
    }, []);

    const handleLogout = () => {
        Cookies.remove("authToken");
        setIsAuthenticated(false);
        router.push("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
            <a className="navbar-brand" href="/">MyNextApp</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" href="/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" href="/">Home</Link>
                    </li>
                    {!isAuthenticated ? (
                        <li className="nav-item">
                            <Link className="nav-link" href="/login">Login</Link>
                        </li>
                    ) : (
                        <li className="nav-item">
                            <button className="btn btn-danger ms-2" onClick={handleLogout}>Logout</button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    </nav>
    )
}
export default Navbar;