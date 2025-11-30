import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EstimationEvent } from '@/lib/types'
import { Clock, Drop } from '@phosphor-icons/react'

interface HistoryListProps {
  events: EstimationEvent[]
}

export function HistoryList({ events }: HistoryListProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Clock size={40} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
            <p className="text-muted-foreground">
              Start analyzing products to build your water footprint history
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{event.productName}</CardTitle>
                <Badge variant="outline">
                  {Math.round(event.confidence * 100)}%
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(event.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {event.imageData && (
                <img
                  src={event.imageData}
                  alt={event.productName}
                  className="w-full h-32 object-cover rounded-md border border-border"
                />
              )}
              <div className="flex items-baseline gap-2">
                <Drop size={20} weight="fill" className="text-primary" />
                <span className="text-2xl font-semibold text-primary">
                  {event.waterLiters.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">liters</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
