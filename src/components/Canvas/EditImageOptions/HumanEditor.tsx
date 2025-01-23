"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function HumanEditor() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Human</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Person Description</Label>
          <Input id="description" placeholder="Describe the person..." />
        </div>
        <Button className="w-full">Update Person</Button>
      </CardContent>
    </Card>
  )
}

