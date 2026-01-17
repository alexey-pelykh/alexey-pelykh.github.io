"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalButtonProps {
  className?: string;
}

export default function CalButton({ className }: CalButtonProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        "styles": {
          "branding": {
            "brandColor": "#000000",
          }
        },
        "hideEventTypeDetails": true,
        "layout": "month_view",
      });
    })();
  }, [])
  return (
    <>
      <Button variant="default" size="sm" className={cn("h-7 px-3 py-2", className)} data-cal-namespace="" data-cal-link="alexey-pelykh/meeting" data-cal-config='{"layout":"month_view"}'>
        Book a Meeting
      </Button>
    </>
  );
};
