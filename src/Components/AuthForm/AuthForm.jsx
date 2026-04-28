import { useState } from 'react'
import './AuthForm.css'

const AuthForm = ({ mode, onCancel, onComplete }) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const isLogin = mode === 'login'
    const title = isLogin ? 'Login to TASK' : 'Create your TASK account'
    const buttonText = isLogin ? 'Login' : 'Sign Up'
    const helperText = isLogin
        ? 'Use this temporary form now. Real authentication can plug into the same submit handler later.'
        : 'Create a temporary profile so the navbar can show your first name and avatar.'

    const handleSubmit = (event) => {
        event.preventDefault()
        const trimmedName = fullName.trim()
        const trimmedEmail = email.trim()
        const displayName = isLogin ? trimmedEmail.split('@')[0] : trimmedName

        if (displayName && trimmedEmail && password) {
            onComplete({ name: displayName, email: trimmedEmail })
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
                        <button className="auth-form__button" type="submit">
                            {buttonText}
                        </button>
                        <button
                            className="auth-form__button auth-form__button--ghost"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default AuthForm
