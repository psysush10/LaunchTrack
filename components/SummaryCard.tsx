interface SummaryCardProps{
    title: string
    value: number
    valueColor?: string
}

export default function SummaryCard({
    title,
    value,
    valueColor = "text-black"
}: SummaryCardProps){
    return (
        <div className="bg-white border p-4 rounded">
            <div className="text-sm text-gray-500">
            {title}
            </div>
            <div className={`text-2xl font-bold ${valueColor}`}>
            {value}
            </div>
        </div>
    )
}