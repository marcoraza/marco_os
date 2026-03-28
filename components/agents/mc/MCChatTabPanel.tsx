/**
 * MCChatTabPanel — Sprint 4
 *
 * Full-tab wrapper for the Chat section.
 * Composes MCInterAgentStrip (collapsible top) + MCChatPanel (main area).
 * When MCAgentsShell opens a chat via openChatForAgent(), the chatAgentId
 * is passed down to pre-select the matching conversation.
 */
import React from 'react';
import { useMissionControlStore } from '../../../store/missionControl';
import { MCInterAgentStrip } from './MCInterAgentStrip';
import { MCChatPanel } from './MCChatPanel';

export function MCChatTabPanel() {
  // If a specific agent was targeted (e.g. from Painel click), pass it to pre-select
  const chatAgentId = useMissionControlStore((s) => s.chatAgentId);

  return (
    <div className="flex flex-col h-full">
      <MCInterAgentStrip />
      <div className="flex-1 min-h-0 overflow-hidden">
        <MCChatPanel agentId={chatAgentId ?? undefined} />
      </div>
    </div>
  );
}
