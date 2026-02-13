"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormSkeleton() {
  return (
    <Card className="py-0 overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="p-6 sm:p-10">
          <CardHeader className="p-0 space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>

          <CardContent className="p-0 mt-8 space-y-5">
            {/* input 1 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* input 2 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* button */}
            <Skeleton className="h-11 w-full rounded-md" />

            {/* links */}
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden md:flex">
          <div className="absolute inset-0 bg-muted" />
          <div className="relative z-10 w-full p-10 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </Card>
  );
}