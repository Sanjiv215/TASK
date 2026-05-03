import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase'
import './AuthForm.css'

const AuthForm = ({ mode, onCancel, onComplete }) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isLogin = mode === 'login'
    const title = isLogin ? 'Login to TASK' : 'Create your TASK account'
    const buttonText = isLogin ? 'Login' : 'Sign Up'
    const helperText = isLogin
        ? 'Login with the email and password you used when creating your account.'
        : 'Create your account with Firebase email and password authentication.'

    const getErrorMessage = (firebaseError) => {
        switch (firebaseError.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try logging in.'
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.'
            case 'auth/password-does-not-meet-requirements':
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.'
            case 'auth/invalid-email':
                return 'Enter a valid email address.'
            default:
                return firebaseError.message || 'Authentication failed.'
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const trimmedName = fullName.trim()
        const trimmedEmail = email.trim()

        setError('')
        setIsSubmitting(true)

        try {
            const credential = isLogin
                ? await signInWithEmailAndPassword(auth, trimmedEmail, password)
                : await createUserWithEmailAndPassword(auth, trimmedEmail, password)

            if (!isLogin && trimmedName) {
                await updateProfile(credential.user, { displayName: trimmedName })
            }

            const displayName = credential.user.displayName || trimmedName || trimmedEmail.split('@')[0]

            onComplete({
                id: credential.user.uid,
                name: displayName,
                email: credential.user.email,
            })
        } catch (authError) {
            setError(getErrorMessage(authError))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-form" aria-label={`${buttonText} form`} role="dialog">
            <div className="auth-form__backdrop" onClick={onCancel} />
            <div className="auth-form__panel">
                <div className="auth-form__header">
                    <div>
                        <span className="auth-form__eyebrow">{isLogin ? 'Welcome' : 'New here'}</span>
                        <h2 className="auth-form__title">{title}</h2>
                        <p className="auth-form__copy">
                            {helperText}
                        </p>
                    </div>
                    <button className="auth-form__close" type="button" onClick={onCancel} aria-label="Close auth form">
                        ×
                    </button>
                </div>

                <form className="auth-form__form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <label className="auth-form__field">
                            <span>Full name</span>
                            <input
                                autoFocus
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="Sanjiv Kumar"
                                autoComplete="name"
                                required
                            />
                        </label>
                    )}

                    <label className="auth-form__field">
                        <span>Email</span>
                        <input
                            autoFocus={isLogin}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="auth-form__field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            required
                        />
                    </label>

                    <div className="auth-form__actions">
                        <button className="auth-form__button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Please wait...' : buttonText}
                        </button>
                        <button
                            className="auth-form__button auth-form__button--ghost"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>

                    {error && <p className="auth-form__error">{error}</p>}
                </form>
            </div>
        </section>
    )
}

export default AuthForm
