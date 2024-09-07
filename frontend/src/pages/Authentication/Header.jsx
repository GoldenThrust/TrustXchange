export function Header() {
    return (
        <header>
            <div className="lg:flex-1">
                <a href="/" className="m-1.5 p-1.5">
                    <span className="m-auto sr-only">TrustXchange</span>
                    <img
                        alt="logo"
                        src="logo.svg"
                        className="m-auto h-8 w-auto"
                    />
                </a>
            </div>
        </header>
    )
}