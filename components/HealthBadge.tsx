interface HealthBadgeProps {
    status : string
}

export default function HealthBadge({
    status
}:HealthBadgeProps){

    let bgColor = "bg-green-100 text-green-700"
    let label = "🟢 Healthy"

    if(status === "Warning"){
        bgColor = "bg-yellow-100 text-yellow-700"
        label = "🟡 Warning"
    }

    if(status === "At Risk"){
        bgColor = "bg-red-100 text-red-700"
        label = "🔴 At Risk"
    }

    return (
        <div
        className={`inline-block px-2 py-1 rounded text-sm font-medium ${bgColor}`}
        >
        {label}
        </div>
    )

}