import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: 'AIzaSyBYdsPvXJQyM7d6WN0eCswoiVrwMDBReAE',
    authDomain: 'code-876cd.firebaseapp.com',
    projectId: 'code-876cd',
    storageBucket: 'code-876cd.firebasestorage.app',
    messagingSenderId: '180093755042',
    appId: '1:180093755042:web:222f40440bc70fbecbc1fb',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
