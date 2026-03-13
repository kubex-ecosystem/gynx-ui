import { Lock } from "lucide-react";
import React from "react";
import Card from "@/components/ui/Card";

interface AccessNoticeProps {
  title: string;
  description: string;
}

const AccessNotice: React.FC<AccessNoticeProps> = ({ title, description }) => {
  return (
    <Card className="border-status-warning/30 bg-status-warning/5 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-status-warning/20 bg-status-warning/10 p-2 text-status-warning">
          <Lock size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-xs text-secondary">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default AccessNotice;
