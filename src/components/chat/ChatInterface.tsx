"use client";

import React, { useState, useEffect, useRef } from "react";
import { getChatMessagesAction, sendChatMessageAction } from "@/app/actions/chat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Send, Video, MessageSquare, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  weddingId: string;
  senderName: string;
  senderEmail?: string | null;
  senderRole: string;
  message: string;
  createdAt: Date | string;
}

interface ChatInterfaceProps {
  weddingId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMessages: any[];
  currentUserName: string;
  currentUserRole: "admin" | "coordinator" | "client" | "guest";
  guestCode?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  weddingId,
  initialMessages,
  currentUserName,
  currentUserRole,
  guestCode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"call" | "chat">("call");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check if we are on desktop screens (min-width: 1024px)
  useEffect(() => {
    const checkMediaQuery = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkMediaQuery();
    window.addEventListener("resize", checkMediaQuery);
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  // Scroll to bottom on load and whenever messages array changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getChatMessagesAction(weddingId);
        if (res.success && res.messages) {
          setMessages((prev) => {
            // Keep any local optimistic messages that haven't been resolved yet
            const pendingOptimistic = prev.filter(
              (m) =>
                m.id.startsWith("temp-") &&
                !res.messages!.some(
                  (sm) => sm.message === m.message && sm.senderName === m.senderName
                )
            );

            // Merge server messages and pending optimistic messages, sorting them chronologically
            const combined = [...(res.messages as ChatMessage[]), ...pendingOptimistic];
            return combined.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        }
      } catch (err) {
        console.error("Failed to poll chat messages:", err);
      }
    };

    const intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [weddingId]);

  // Handle message sending
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue(""); // Clear input early for instant feel
    setIsSending(true);

    // 1. Optimistic append
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      weddingId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderEmail: null,
      message: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Server Action Call
      const res = await sendChatMessageAction(
        messageText,
        currentUserName,
        currentUserRole,
        weddingId,
        guestCode
      );

      if (res.error) {
        setToast({ message: res.error, type: "error" });
        // Rollback optimistic update
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInputValue(messageText); // Restore input text
      } else if (res.success && res.message) {
        // Replace optimistic message with the database saved version
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as ChatMessage) : m))
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setToast({ message: "Failed to send message. Please try again.", type: "error" });
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputValue(messageText); // Restore input text
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    const r = role.toLowerCase();
    switch (r) {
      case "admin":
        return "bg-violet-100 text-[#2d336b] dark:bg-violet-900/30 dark:text-violet-300";
      case "coordinator":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "client":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
      case "guest":
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300";
    }
  };

  const getRoleDisplayName = (role: string) => {
    const r = role.toLowerCase();
    switch (r) {
      case "admin":
        return "Admin";
      case "coordinator":
        return "Coordinator";
      case "client":
        return "Client";
      case "guest":
        return "Guest";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const formatTimestamp = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const isToday = new Date().toDateString() === d.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const renderJitsiCallIframe = () => {
    const iframeSrc = `https://meet.jit.si/savazar-wedding-${weddingId}#userInfo.displayName="${encodeURIComponent(
      currentUserName
    )}"`;

    return (
      <iframe
        src={iframeSrc}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full min-h-[500px] lg:h-[600px] border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm bg-slate-900"
      />
    );
  };

  const renderChatLogContainer = () => {
    return (
      <div className="flex flex-col h-[500px] lg:h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <MessageSquare className="h-4 w-4 text-[#6771ab]" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Chat Room</h3>
        </div>

        {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
                <MessageSquare className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No messages yet.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Type a message below to start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe =
                msg.senderName === currentUserName &&
                msg.senderRole.toLowerCase() === currentUserRole.toLowerCase();

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {msg.senderName}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium tracking-wide uppercase ${getRoleBadgeStyles(
                        msg.senderRole
                      )}`}
                    >
                      {getRoleDisplayName(msg.senderRole)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatTimestamp(msg.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] px-4 py-2.5 shadow-sm text-sm ${
                      isMe
                        ? "bg-[#6771ab] text-white rounded-2xl rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 rounded-2xl rounded-tl-none"
                    } break-words`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab] dark:text-slate-100 dark:placeholder-slate-500 transition-all"
          />
          <Button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            variant="primary"
            className="rounded-xl flex items-center justify-center p-2.5 h-10 w-10 shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <div className="w-full">
      {isDesktop ? (
        /* Desktop grid view */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[600px]">
            {renderJitsiCallIframe()}
          </div>
          <div className="lg:col-span-1 h-[600px]">
            {renderChatLogContainer()}
          </div>
        </div>
      ) : (
        /* Mobile/tablet tabbed view */
        <div className="w-full">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Mode: {activeTab === "call" ? "Video Call" : "Chat Room"}
          </div>
          <Tabs
            defaultValue="call"
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <div
                onClick={() => setActiveTab("call")}
                className="flex-1 flex cursor-pointer"
              >
                <TabsTrigger
                  value="call"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </TabsTrigger>
              </div>
              <div
                onClick={() => setActiveTab("chat")}
                className="flex-1 flex cursor-pointer"
              >
                <TabsTrigger
                  value="chat"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat Room</span>
                </TabsTrigger>
              </div>
            </TabsList>
            <TabsContent value="call" className="pt-0">
              <div className="h-[500px]">
                {renderJitsiCallIframe()}
              </div>
            </TabsContent>
            <TabsContent value="chat" className="pt-0">
              <div className="h-[500px]">
                {renderChatLogContainer()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
