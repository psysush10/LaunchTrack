type Milestone = {
    id: string
    status: string
    depends_on?: string[]
}

export function hasIncompleteDependencies(
    milestone:Milestone,
    allMilestones: Milestone[]
){
    const dependencyIds = milestone.depends_on || []

    if (dependencyIds.length === 0){
        return false
    }

    const hasIncomplete = allMilestones.some((milestoneItem) => {
        return(
            dependencyIds.includes(milestoneItem.id) &&
            milestoneItem.status !== 'Completed'
        )
    })

    return hasIncomplete
}

export function getComputedStatus(
    milestone: Milestone,
    allMilestones: Milestone[]){

        if(milestone.status === 'Completed'){
            return 'Completed'
        }

        const isBlocked = hasIncompleteDependencies(
            milestone,
            allMilestones
        )

        if(isBlocked){
            return 'Blocked'
        }

        return milestone.status


    }