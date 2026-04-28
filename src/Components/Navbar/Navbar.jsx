import { useMemo, useState } from 'react'
import AuthForm from '../AuthForm/AuthForm'
import './Navbar.css'

const Navbar = () => {
    const [authMode, setAuthMode] = useState('')
    const [user, setUser] = useState(null)

    const firstName = useMemo(() => {
        return user?.name?.trim().split(/\s+/)[0] || ''
    }, [user])

    const userInitial = firstName.charAt(0).toUpperCase()

    const openAuth = (mode) => {
        setAuthMode(mode)
    }

    const handleAuthComplete = (authUser) => {
        setUser(authUser)
        setAuthMode('')
    }

    return (
        <header className="navbar">
            <nav className="navbar__inner" aria-label="Primary navigation">
                <a className="navbar__brand" href="/" aria-label="TASK home">
                    <span className="navbar__brand-mark">T</span>
                    <span>TASK</span>
                </a>

                {user ? (
                    <div className="navbar__user" aria-label="Signed in user">
                        <span className="navbar__name">{firstName}</span>
                        <span className="navbar__avatar" aria-hidden="true">
                            {userInitial}
                        </span>
                        <button
                            className="navbar__button navbar__button--ghost"
                            type="button"
                            onClick={() => setUser(null)}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="navbar__actions">
                        <button
                            className="navbar__button navbar__button--ghost"
                            type="button"
                            onClick={() => openAuth('login')}
                        >
                            Login
                        </button>
                        <button
                            className="navbar__button"
                            type="button"
                            onClick={() => openAuth('signup')}
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </nav>

            {authMode && !user && (
                <AuthForm
                    mode={authMode}
                    onCancel={() => setAuthMode('')}
                    onComplete={handleAuthComplete}
                />
            )}
        </header>
    )
}

export default Navbar
