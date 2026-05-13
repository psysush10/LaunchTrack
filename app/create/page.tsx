'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import FormInput from '@/components/FormInput'
import SuccessModal from '@/components/SuccessModal'

export default function CreateProject() {

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientName, setClientName] = useState('')
  const [goLiveDate, setGoLiveDate] = useState('')
  const [showSuccess, setShowSuccess] = useState(false);

  const playSuccessSound = () => {
  const audio = new Audio("/sounds/success.mp3");
  audio.volume = 0.4;
  audio.play();
};

  const createProject = async () => {

  try{
       if(!clientName || !goLiveDate){
        setError("Please fill all fields")
        return
      }
      setLoading(true)

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
          throw error
        }

      const projectId = data?.[0]?.id

      await createMilestones(projectId)

      playSuccessSound()
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      },2200)

      // alert("Implementation created")
      setClientName("")
      setGoLiveDate("")
      setError("")
      setTimeout(() => {
        router.push(`/projects/${projectId}`)
      },2600)

  }catch(err: any){
    console.log("Supabase Error:", err)
    setError(err.message)
          return
  }finally{
    setLoading(false)
  }

  }

  const createMilestones = async (projectId:string) => {


    try{
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
        throw error
      }
    }catch(err: any){
        console.log("Supabase Error:", err)
          setError(err.message)
          return
    }
    
  }

  

  return (
    
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Create Implementation
      </h1>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      <FormInput
        placeholder="Client Name"
        value={clientName}
        onChange={setClientName}
      />

      <FormInput
        type="date"
        placeholder="Go Live Date"
        value={goLiveDate}
        onChange={setGoLiveDate}
      />


      <button
        disabled={loading}
        onClick={createProject}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating ..." : "Create Implementation"} 
      </button>

      <SuccessModal isVisible={showSuccess} />

    </div>
  )
}