"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CanvasEditor() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit in Canvas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">Canvas Editor Interface</div>
      </CardContent>
    </Card>
  )
}

