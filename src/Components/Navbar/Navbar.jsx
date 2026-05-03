import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import AuthForm from '../AuthForm/AuthForm'
import './Navbar.css'

const Navbar = () => {
    const [authMode, setAuthMode] = useState('')
    const [user, setUser] = useState(null)

    const firstName = useMemo(() => {
        return user?.name?.trim().split(/\s+/)[0] || ''
    }, [user])

    const userInitial = firstName.charAt(0).toUpperCase()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email,
                })
                return
            }

            setUser(null)
        })

        return unsubscribe
    }, [])

    const openAuth = (mode) => {
        setAuthMode(mode)
    }

    const handleAuthComplete = (authUser) => {
        setUser(authUser)
        setAuthMode('')
    }

    const handleLogout = async () => {
        await signOut(auth)
        setUser(null)
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
                            onClick={handleLogout}
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
