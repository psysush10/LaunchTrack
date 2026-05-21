'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Timeline from "@/components/Timeline"
import { getComputedStatus } from '@/utils/milestone'

export default function ProjectPage() {

  const params = useParams()
  const projectId = params.id as string

  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingRisk, setIsAddingRisk] = useState(false)
  const [error, setError] = useState("")
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
    setLoading(false)
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
  if(!riskText) {
    setError("Please enter the risk")
    return
  }
  try{
    setIsAddingRisk(true)
    const { error } = await supabase
    .from('risks')
    .insert({
      project_id: projectId,
      description: riskText
    })

  if(error){
    console.error(error)
    setError("Unable to add risk. Please try again.")
    return
  }

  setRiskText("")
  setError("")
  fetchRisks()
  }catch(err:any){
    setError(err.message)
  }finally{
    setIsAddingRisk(false)
  }
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

  const currentMilestone = computedMilestones.find(
    (milestone) => milestone.id === milestoneId
  )

  if(
    currentMilestone?.computedStatus ==="Blocked" && 
    status == "Completed"
  ){
    alert("Resolve dependencies first")
    return
  }

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

//assign single dependency for milestone
const handleDependencyChange = async (milestoneId:string, dependencyId:string) => {
  const updatedDependencies = dependencyId
  ? [dependencyId]
  : []

  const {error} = await supabase
    .from("milestones")
    .update({
      depends_on: updatedDependencies
    })
    .eq("id",milestoneId)

  if(error){
    console.log(error)
    return
  }

  setMilestones((prev) =>
  prev.map((milestone) => 
  milestone.id === milestoneId
  ?{
    ...milestone,
    depends_on: updatedDependencies
  }
  : milestone
  )
)
}
//status colour for UI based on milestone status
const getStatusColor = (status: string) => {
  if (status === "Completed") return "bg-green-100 text-green-800"
  if (status === "In Progress") return "bg-blue-100 text-blue-800"
  if (status === "Blocked") return "bg-red-100 text-red-800"

  return "bg-gray-100 text-gray-700"
}

//computedMilestones

const computedMilestones = milestones.map((milestone) => ({
  ...milestone,
  computedStatus: getComputedStatus(milestone,milestones)
}))

if (loading) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Progress skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">

        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>

        <div className="h-8 w-20 bg-gray-200 rounded mb-6"></div>

        <div className="h-3 w-full bg-gray-200 rounded-full"></div>

      </div>
      {/* Timeline Skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">

        <div className="h-6 w-52 bg-gray-200 rounded mb-8"></div>

        <div className="flex justify-between">

          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200"></div>

              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}

        </div>
      </div>

      {/* Milestone Skeleton */}
      <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse"
        >

          <div className="flex justify-between items-start">

            <div className="space-y-3">

              <div className="h-5 w-40 bg-gray-200 rounded"></div>

              <div className="h-4 w-56 bg-gray-200 rounded"></div>

            </div>

            <div className="flex gap-3">

              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>

              <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>

            </div>

          </div>

  </div>
))}
      </div>
    </div>

    
  )
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Implementation Milestones
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">

  <div className="flex items-center justify-between mb-4">

    <div>
      <p className="text-sm text-gray-500">
        Overall Progress
      </p>

      <p className="text-2xl font-bold">
        {progress}%
      </p>
    </div>

    <div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium
        ${health === "Healthy" ? "bg-green-100 text-green-700" : ""}
        ${health === "Warning" ? "bg-yellow-100 text-yellow-700" : ""}
        ${health === "At Risk" ? "bg-red-100 text-red-700" : ""}
      `}>
        {health}
      </span>
    </div>

  </div>

  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className="bg-blue-500 h-3 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>

</div>

      <div className="bg-white border border-gray-200 rounded-2xl px-6 pt-5 pb-5 shadow-sm mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Implementation Timeline
        </h2>
        <div className="mt-4">
                  <Timeline milestones={computedMilestones} />
        </div>

      </div>

      {computedMilestones.map((m)=>{
        const displayStatus = m.computedStatus || m.status
        return(
        <div 
          key={m.id} 
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-5">
        <div 
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

        <div className="flex flex-col">

        <div className="flex items-center gap-3">

          <h3 className="text-lg font-semibold">
            {m.name}
          </h3>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}
          >
            {displayStatus}
          </span>

        </div>

        {m.due_date && (
          <div className="text-xs text-gray-500 mt-1">
            Due: {new Date(m.due_date).toLocaleDateString()}
          </div>
        )}

        {m.depends_on?.length > 0 &&(
          <p className='text-xs text-gray-500 mt-1'>
            Depends on: {
              computedMilestones.find(
                (milestone) => milestone.id === m.depends_on[0]
              )?.name
            }
          </p>
        )}

        {displayStatus === "Blocked" && (
          <p className="text-sm text-orange-500 mt-2">
            Resolve dependency before completing this milestone
          </p>
        )}

        </div>

        <div
        className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
          
          <select
            value={m.status}
            onChange={(e)=>updateStatus(m.id, e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Blocked</option>
          </select>

          <select
            value={m.depends_on?.[0] || ""}
            onChange={(e)=>handleDependencyChange(m.id, e.target.value)}
            className='border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white'
          >
            <option value="">No Dependency</option>
            {computedMilestones
            .filter((milestone) => milestone.id !== m.id)
            .map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.name}
              </option>
            ))}
            </select> 
        </div>
        </div>
        </div>
        )
      })}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-12">

    <h2 className="text-lg font-semibold mb-4">
      ⚠ Implementation Risks
    </h2>

    {error &&(
        <p className='text-red-500'>
          {error}
        </p>  
      )}  

    <div className="flex gap-2 mb-4">
      <input
        value={riskText}
        onChange={(e)=>{
          setRiskText(e.target.value)
          if(error) setError("")
        }}
        placeholder="Describe risk..."
        className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
      />

      <button
        onClick={addRisk}
        disabled={isAddingRisk}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
      >
        {isAddingRisk? "Adding..." : "Add Risk"}
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