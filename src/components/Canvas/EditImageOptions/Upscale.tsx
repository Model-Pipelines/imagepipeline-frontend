"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function Upscale() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upscale Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scale Factor</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select scale" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="2x" className="hover:bg-slate-500 cursor-pointer">2x</SelectItem>
              <SelectItem value="4x" className="hover:bg-slate-500 cursor-pointer">4x</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full">Upscale Image</Button>
      </CardContent>
    </Card>
  )
}

