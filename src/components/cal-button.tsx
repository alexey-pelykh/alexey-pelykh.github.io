"use client";
import { Button } from "@/components/ui/button";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";


export default function CalButton() {
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
      <Button variant="default" className="sm h-7 px-3 py-2" data-cal-namespace="" data-cal-link="alexey-pelykh/meeting" data-cal-config='{"layout":"month_view"}'>
        Book a Meeting
      </Button>
    </>
  );
};
