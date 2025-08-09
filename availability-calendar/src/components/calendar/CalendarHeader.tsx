type CalanderHeaderProps = {
    days: { short: string; date: string }[];
    visibleDays: number;
}

export default function CalendarHeader ({days, visibleDays}: CalanderHeaderProps) {
    return (
    <>
        <div className="bg-gray-50 p-3"></div>
        {days.map((day, index) => (
            index >= visibleDays - 7 && index < visibleDays && 
            <div key={day.short} className="bg-gray-50 p-3 text-center border-l border-gray-300">
            <div className="text-sm text-gray-600">{day.date}</div>
            <div className="font-semibold">{day.short}</div>
            </div>
        ))}
    </>
)}

