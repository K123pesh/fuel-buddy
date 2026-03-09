import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { VoiceOrderingDialog } from "./VoiceOrderingDialog";

export const VoiceOrderingButton = ({ userId }: { userId?: string }) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        size="lg"
        className="gap-2 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm"
      >
        <Mic className="h-5 w-5 text-gray-600" />
        Voice Order
      </Button>

      <VoiceOrderingDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        userId={userId}
      />
    </>
  );
};
