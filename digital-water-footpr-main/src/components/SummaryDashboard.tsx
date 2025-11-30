import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Summary } from '@/lib/types'
import { ChartBar, Drop, Flask } from '@phosphor-icons/react'

interface SummaryDashboardProps {
  summary: Summary
}

export function SummaryDashboard({ summary }: SummaryDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Flask size={16} />
              Total Analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{summary.totalAnalyses}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Drop size={16} weight="fill" />
              Total Virtual Water
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {summary.totalWaterLiters.toLocaleString()}
              </span>
              <span className="text-xl text-muted-foreground">liters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {summary.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar size={24} />
              Top Products by Water Usage
            </CardTitle>
            <CardDescription>Your highest water footprint items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {summary.topProducts.map((product, index) => (
                <div
                  key={`${product.productName}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">{product.count} analysis</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-primary">
                      {product.waterLiters.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">liters</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
