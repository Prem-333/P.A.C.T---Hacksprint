"use client";

/**
 * @module TransactionLog
 * @description Displays ISO 20022 formatted transaction records.
 * Shows a collapsible list of recent transactions with their pacs.008 JSON payloads.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ISO20022Message } from "@/types";
import { ListTodo, ChevronDown } from "lucide-react";

interface TransactionLogEntry {
  txHash: string;
  type: string;
  timestamp: number;
  iso20022: ISO20022Message;
}

interface TransactionLogProps {
  /** List of transaction records with ISO 20022 data. */
  entries: TransactionLogEntry[];
}

export function TransactionLog({ entries }: TransactionLogProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 rounded-md bg-white">
        <ListTodo className="w-8 h-8 text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-900 mb-1">
          No transactions yet
        </p>
        <p className="text-xs text-slate-500 max-w-[280px] text-center">
          Execute a contract interaction to see ISO 20022 compliance data appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
          <h3 className="text-[15px] font-bold text-slate-900">
            ISO 20022 Transaction Log
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-medium tracking-wide">
          pacs.008.001.08
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {entries.map((entry, index) => (
          <div key={entry.txHash + index}>
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white group"
            >
              <div className="flex items-center gap-8">
                <span className="text-[12px] font-mono text-slate-500 font-medium uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                  {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-sm bg-[#e2e8f0]/60 text-[#334155] font-bold tracking-wider">
                  {entry.type}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-slate-500 font-medium">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden bg-slate-50 border-t border-slate-100"
                >
                  <div className="px-6 py-5">
                    <div className="bg-white rounded-md p-4 overflow-x-auto border border-slate-200 shadow-sm">
                      <pre className="text-[11px] font-mono text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(entry.iso20022, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
