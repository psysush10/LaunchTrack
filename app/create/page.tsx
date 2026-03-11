'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CreateProject() {

  const [clientName, setClientName] = useState('')
  const [goLiveDate, setGoLiveDate] = useState('')

  const createProject = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    const { data: membership } = await supabase
  .from('organization_members')
  .select('organization_id')
  .eq('user_id', user?.id)
  .single()

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          client_name: clientName,
          go_live_date: goLiveDate,
          organization_id: membership?.organization_id
        }
      ])
      .select()

    if(error){
      console.log("Supabase Error:", error)
  alert(error.message)
  return
    }

    const projectId = data?.[0]?.id

    await createMilestones(projectId)

    alert("Implementation created")
  }

  const createMilestones = async (projectId:string) => {

    const milestones = [
      { name: "Discovery", order_index: 1 },
      { name: "Configuration", order_index: 2 },
      { name: "Data Migration", order_index: 3 },
      { name: "Integrations", order_index: 4 },
      { name: "UAT", order_index: 5 },
      { name: "Training", order_index: 6 },
      { name: "Go Live", order_index: 7 }
    ]

    const milestoneRows = milestones.map(m => ({
      project_id: projectId,
      name: m.name,
      order_index: m.order_index,
      status: "Not Started"
    }))

    const {error} = await supabase
      .from('milestones')
      .insert(milestoneRows)

      if(error){
        console.error("Milestone insert failed:", error)
      }
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