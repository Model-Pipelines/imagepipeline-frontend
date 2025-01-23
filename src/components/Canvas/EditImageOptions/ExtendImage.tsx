"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ExtendImage() {
  return (
    <Card className="w-ful">
      <CardHeader>
        <CardTitle>Extend Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black ">
              <SelectItem value="up" className="hover:bg-slate-500 cursor-pointer">Up</SelectItem>
              <SelectItem value="down" className="hover:bg-slate-500 cursor-pointer">Down</SelectItem>
              <SelectItem value="left" className="hover:bg-slate-500 cursor-pointer">Left</SelectItem>
              <SelectItem value="right" className="hover:bg-slate-500 cursor-pointer">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full">Extend Image</Button>
      </CardContent>
    </Card>
  )
}

