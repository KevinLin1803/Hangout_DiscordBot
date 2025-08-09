import { Button } from './ui/button';

type PaginateProps = {
    days: { short: string; date: string }[];
    selectedMode: AvailabilityStatus;
    visibleDays: number;
    handleVisibleDays: (data: number) => void;
}

type AvailabilityStatus = "available" | "unavailable" | "if-needed"

export default function Paginate ({days, selectedMode, visibleDays, handleVisibleDays}: PaginateProps) {

    const prevWeek = () => {
        if (days.length > 7) {
            handleVisibleDays(Math.max(visibleDays - 7, 7));
        }
    }

    const nextWeek = () => {
        if (visibleDays < days.length) {
            handleVisibleDays(visibleDays + 7);
        }
    }
    
    return (
        <div className="flex justify-between">
            <Button
            variant={selectedMode === "if-needed" ? "default" : "outline"}
            size="sm"
            onClick={prevWeek}
            className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
            >
                Prev week
            </Button>

            <Button
            variant={selectedMode === "if-needed" ? "default" : "outline"}
            size="sm"
            onClick={nextWeek}
            className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
            >
                Next week
            </Button>
        </div>
    )
}

