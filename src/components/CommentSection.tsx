"use client";

import { useState } from "react";

import CommentComposer from "@/components/CommentComposer";
import CommentTimeline from "@/components/CommentTimeline";

type CommentSectionProps = {
  projectId: string;
  trackId: string;
  defaultVersionId?: string;
};

export default function CommentSection({
  projectId,
  trackId,
  defaultVersionId,
}: CommentSectionProps) {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="space-y-8">
      <CommentComposer
        projectId={projectId}
        trackId={trackId}
        defaultVersionId={defaultVersionId}
        onCommentPosted={() => setRefreshToken((value) => value + 1)}
      />
      <CommentTimeline
        projectId={projectId}
        trackId={trackId}
        refreshToken={refreshToken}
      />
    </div>
  );
}
