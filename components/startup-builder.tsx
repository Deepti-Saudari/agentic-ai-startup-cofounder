"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiUrl } from "@/lib/api"

export default function StartupBuilder() {

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runStartupBuilder = async () => {

    setLoading(true)

    try {

      const response = await fetch(getApiUrl("/startup-builder"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skills: "AI, machine learning, backend engineering",
          interests: "healthcare, robotics",
          experience: "software developer"
        })
      })

      const data = await response.json()

      setResult(data.startup)

    } catch (error) {

      console.error("Startup Builder Error:", error)

    }

    setLoading(false)

  }

  return (
    <div className="space-y-6">

      <Button onClick={runStartupBuilder} disabled={loading}>

        {loading ? "Generating Startup..." : "Generate Full Startup Plan"}

      </Button>

      {result && (

        <div className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle>Selected Startup Idea</CardTitle>
            </CardHeader>
            <CardContent>
              {result.selected_idea}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Research</CardTitle>
            </CardHeader>
            <CardContent>
              {JSON.stringify(result.market_research, null, 2)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {JSON.stringify(result.business_plan, null, 2)}
            </CardContent>
          </Card>

        </div>

      )}

    </div>
  )
}