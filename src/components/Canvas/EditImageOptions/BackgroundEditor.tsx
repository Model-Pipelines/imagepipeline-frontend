"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BackgroundEditor() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Background Prompt</Label>
          <Input id="prompt" placeholder="Describe the new background..." />
        </div>
        <Button className="w-full">Generate New Background</Button>
      </CardContent>
    </Card>
  )
}

