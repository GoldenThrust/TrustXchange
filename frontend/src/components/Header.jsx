import PropTypes from "prop-types"
import { Link } from "react-router-dom"

export function Header({ children, className }) {
    return (
        <header className={`m-1.5 p-1.5 ${className}`}>
            <div>
                <Link to="/">
                    <span className="m-auto sr-only">TrustXchange</span>
                    <img
                        alt="logo"
                        src="logo.svg"
                        className="m-auto h-8 w-auto"
                    />
                </Link>
            </div>
            {children}
        </header>
    )
}

Header.propTypes = {
    children: PropTypes.object,
    className: PropTypes.string,
}