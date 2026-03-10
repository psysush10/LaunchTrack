'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CreateProject() {

  const [clientName, setClientName] = useState('')
  const [goLiveDate, setGoLiveDate] = useState('')

  const createProject = async () => {

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          client_name: clientName,
          go_live_date: goLiveDate
        }
      ])
      .select()

    if(error){
      console.error(error)
      return
    }

    const projectId = data?.[0]?.id

    await createMilestones(projectId)

    alert("Implementation created")
  }

  const createMilestones = async (projectId:string) => {

    const milestones = [
      { name: "Discovery" },
      { name: "Configuration" },
      { name: "Data Migration" },
      { name: "Integrations" },
      { name: "UAT" },
      { name: "Training" },
      { name: "Go Live" }
    ]

    const milestoneRows = milestones.map(m => ({
      project_id: projectId,
      name: m.name,
      status: "Not Started"
    }))

    await supabase
      .from('milestones')
      .insert(milestoneRows)
  }

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Create Implementation
      </h1>

      <input
        type="text"
        placeholder="Client Name"
        value={clientName}
        onChange={(e)=>setClientName(e.target.value)}
        className="border p-2 block mb-4"
      />

      <input
        type="date"
        value={goLiveDate}
        onChange={(e)=>setGoLiveDate(e.target.value)}
        className="border p-2 block mb-4"
      />

      <button
        onClick={createProject}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Implementation
      </button>

    </div>
  )
}