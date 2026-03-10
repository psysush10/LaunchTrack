'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function ProjectPage() {

  const params = useParams()
  const projectId = params.id as string

  const [milestones, setMilestones] = useState<any[]>([])

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)

    if(error){
      console.error(error)
      return
    }

    setMilestones(data || [])
  }

  const updateStatus = async (milestoneId:string, status:string) => {

  const { error } = await supabase
    .from('milestones')
    .update({ status })
    .eq('id', milestoneId)

  if(error){
    console.error(error)
    return
  }

  fetchMilestones()
}

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Implementation Milestones
      </h1>

      <div className="border rounded">

  {milestones.map((m)=>(
    <div key={m.id} className="border-b p-4 flex justify-between">

      <div className="font-semibold">
        {m.name}
      </div>

      <select
        value={m.status}
        onChange={(e)=>updateStatus(m.id, e.target.value)}
        className="border p-1"
      >
        <option>Not Started</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Blocked</option>
      </select>

    </div>
  ))}

</div>

    </div>
  )
}