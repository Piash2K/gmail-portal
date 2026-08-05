"use client";

// src/components/AccountNoteCard.tsx — Associated Email Note Card

import { useState, useEffect } from "react";
import { GmailAccount } from "@/types";
import { useAccountStore } from "@/store/accountStore";
import { cn } from "@/lib/utils";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  StickyNote,
} from "lucide-react";

interface AccountNoteCardProps {
  account: GmailAccount;
  className?: string;
}

export function AccountNoteCard({ account, className }: AccountNoteCardProps) {
  const { updateAccountNote, deleteAccountNote } = useAccountStore();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(account.note || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if active account changes
  useEffect(() => {
    setNoteText(account.note || "");
    setIsEditing(false);
  }, [account.id, account.note]);

  const handleSave = async () => {
    if (!noteText.trim()) {
      handleDelete();
      return;
    }

    setIsSaving(true);
    try {
      await updateAccountNote(account.id, noteText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountNote(account.id);
      setNoteText("");
      setIsEditing(false);
    } catch (err) {
      console.error("Delete note error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasNote = Boolean(account.note && account.note.trim().length > 0);

  return (
    <div
      className={cn(
        "rounded-2xl p-4 bg-[#111620] border border-[#1e2a3a] space-y-3 transition-all",
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">Email Note</h4>
            <p className="text-[10px] text-[#475569] truncate max-w-[170px]">
              {account.email}
            </p>
          </div>
        </div>

        {/* Top actions */}
        {!isEditing && hasNote && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg bg-[#1c2434] hover:bg-[#253248] text-[#94a3b8] hover:text-white transition-colors"
              title="Edit Note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
              title="Delete Note"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      {isEditing ? (
        <div className="space-y-2 pt-1">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Add a note for ${account.email}...`}
            rows={3}
            maxLength={1000}
            className="w-full bg-[#0a0d12] border border-[#2a3a50] focus:border-amber-500/50 rounded-xl p-2.5 text-xs text-white placeholder-[#475569] focus:outline-none transition-colors resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#475569]">
              {noteText.length}/1000 chars
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNoteText(account.note || "");
                  setIsEditing(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1c2434] text-[#94a3b8] hover:text-white text-xs transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : hasNote ? (
        <div className="bg-[#0a0d12] border border-[#1e2a3a] rounded-xl p-3 text-xs text-amber-200/90 whitespace-pre-wrap leading-relaxed">
          {account.note}
        </div>
      ) : (
        <div className="border border-dashed border-[#1e2a3a] hover:border-[#2a3a50] rounded-xl p-4 text-center transition-colors">
          <p className="text-[11px] text-[#475569] mb-2.5">
            No note attached to this email yet.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Note
          </button>
        </div>
      )}
    </div>
  );
}
