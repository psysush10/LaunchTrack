'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {

  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if(error){
      console.error(error)
      return
    }

    setProjects(data || [])
  }

  return (
    <div className="p-10">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Implementation Dashboard
        </h1>

        <Link
          href="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Implementation
        </Link>

      </div>

      <div className="border rounded">

        {projects.map((project)=>(
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="block border-b p-4 hover:bg-gray-100"
          >

            <div className="font-semibold">
              {project.client_name}
            </div>

            <div className="text-sm text-gray-500">
              Go Live: {project.go_live_date}
            </div>

          </Link>
        ))}

      </div>

    </div>
  )
}