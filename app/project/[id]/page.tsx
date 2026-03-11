'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Timeline from "@/app/components/Timeline"

export default function ProjectPage() {

  const params = useParams()
  const projectId = params.id as string

  const [milestones, setMilestones] = useState<any[]>([])
  const [risks, setRisks] = useState<any[]>([])
  const [riskText, setRiskText] = useState("")

  useEffect(() => {
    fetchMilestones()
    fetchRisks()
  }, [])

//fetch milestones
  const fetchMilestones = async () => {

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index',{ascending:true})

    if(error){
      console.error(error)
      return
    }

    setMilestones(data || [])
  }


// fetch risks
    const fetchRisks = async () => {

  const { data, error } = await supabase
    .from('risks')
    .select('*')
    .eq('project_id', projectId)

  if(error){
    console.error(error)
    return
  }

  setRisks(data || [])
}

//add risk creation
const addRisk = async () => {

  if(!riskText) return

  const { error } = await supabase
    .from('risks')
    .insert({
      project_id: projectId,
      description: riskText
    })

  if(error){
    console.error(error)
    return
  }

  setRiskText("")
  fetchRisks()
}
// progress calculation
  const totalMilestones = milestones?.length || 0

  const completedMilestones =
  milestones?.filter(m => m.status === "Completed").length || 0

  const progress =
  totalMilestones === 0
    ? 0
    : Math.round((completedMilestones / totalMilestones) * 100)


// delayed milestones
const today = new Date()

const delayedMilestones =
  milestones?.filter(m => 
    m.due_date &&
    new Date(m.due_date) < today &&
    m.status !== "Completed"
  ) || []

// calculate project health
const getHealth = () => {

  const delayedCount = delayedMilestones.length

  if(delayedCount >= 3) return "At Risk"
  if(delayedCount > 0) return "Warning"

  return "Healthy"
}

const health = getHealth()


  // update milestone status
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
//status colour for UI based on milestone status
const getStatusColor = (status: string) => {
  if (status === "Completed") return "bg-green-100 text-green-800"
  if (status === "In Progress") return "bg-blue-100 text-blue-800"
  if (status === "Blocked") return "bg-red-100 text-red-800"

  return "bg-gray-100 text-gray-700"
}

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Implementation Milestones
      </h1>

      <div className="mb-6">
  <p className="text-sm text-gray-600">
    Progress: {progress}%
  </p>

  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
    <div
      className="bg-blue-500 h-3 rounded-full"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>

<p className="text-sm mt-3 font-medium">
  Health: 
  {health === "Healthy" && " 🟢 Healthy"}
  {health === "Warning" && " 🟡 Warning"}
  {health === "At Risk" && " 🔴 At Risk"}
</p>

<div className="flex items-center gap-4 overflow-x-auto mb-8">
  <div className="mt-6 mb-6">

  <h2 className="text-lg font-semibold mb-2">
    Implementation Timeline
  </h2>

  <Timeline milestones={milestones} />

</div>
</div>

      <div className="border rounded">

  {milestones.map((m)=>(
    <div key={m.id} className="border-b p-4 flex items-center justify-between">

      <div className="flex flex-col">

  <div
    className={`font-semibold px-2 py-1 rounded w-fit ${getStatusColor(m.status)}`}
  >
    {m.name}
  </div>

  {m.due_date && (
    <div className="text-xs text-gray-500 mt-1">
      Due: {new Date(m.due_date).toLocaleDateString()}
    </div>
  )}

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
    <div className="mt-10">

  <h2 className="text-xl font-bold mb-4">
    ⚠ Implementation Risks
  </h2>

  <div className="flex gap-2 mb-4">

    <input
      value={riskText}
      onChange={(e)=>setRiskText(e.target.value)}
      placeholder="Describe risk..."
      className="border p-2 flex-1"
    />

    <button
      onClick={addRisk}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Add Risk
    </button>

  </div>

  <div className="border rounded">

    {risks.map((r)=>(
      <div key={r.id} className="border-b p-3">

        <div className="font-medium">
          {r.description}
        </div>

        <div className="text-xs text-gray-500">
          Severity: {r.severity}
        </div>

      </div>
    ))}

  </div>

</div>
    </div>
  )
}