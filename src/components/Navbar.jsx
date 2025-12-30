import './Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#hero" className="nav-logo">
                    <span className="logo-text">HHeuristics</span>
                </a>

                <ul className="nav-menu">
                    <li><a href="#research" className="nav-link">Research</a></li>
                    <li><a href="#reports" className="nav-link">Reports</a></li>
                    <li><a href="#consulting" className="nav-link">Consulting</a></li>
                    <li><a href="#data" className="nav-link">Data</a></li>
                </ul>

                <a href="#contact" className="nav-cta">Get Started</a>
            </div>
        </nav>
    );
}
