'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      alert(error.message)
      return
    }

    router.push('/')
  }

  return (

<div className="flex items-center justify-center min-h-screen">

  <div className="border p-6 rounded w-80">

    <h1 className="text-xl font-bold mb-4">
      Login
    </h1>

    <input
      className="border p-2 w-full mb-3"
      placeholder="Email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
    />

    <input
      type="password"
      className="border p-2 w-full mb-4"
      placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
    />

    <button
      onClick={login}
      className="bg-blue-600 text-white w-full p-2 rounded"
    >
      Login
    </button>

  </div>

</div>

  )
}