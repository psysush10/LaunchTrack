'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')

    console.log(data, error)
  }

  return <div>ImplTrack Setup Complete</div>
}