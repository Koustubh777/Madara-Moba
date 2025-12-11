import React from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'


export default function Login(){
const auth = getAuth()
const provider = new GoogleAuthProvider()
const login = async () => {
try{
await signInWithPopup(auth, provider)
}catch(e){
alert('Login failed: '+e.message)
}
}
return (
<div className="center">
<h1>Madara MOBA</h1>
<button onClick={login}>Sign in with Google</button>
</div>
)
}
