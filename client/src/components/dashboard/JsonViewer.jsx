import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  Braces
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JsonViewer({ json, onCopy, onDownload }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedPath, setCopiedPath] = useState(null);

  const jsonString = JSON.stringify(json, null, 2);
  const lineCount = jsonString.split('\n').length;

  const handleCopyKey = (key, value) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopiedPath(key);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const renderJsonValue = (value, key = '', level = 0) => {
    const indent = level * 20;
    
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div style={{ marginLeft: `${indent}px` }} className="border-l border-blue-500/20 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                Array ({value.length})
              </Badge>
              <span className="text-blue-300 font-medium">{key}</span>
            </div>
            {value.map((item, index) => (
              <div key={index} className="mb-2">
                {renderJsonValue(item, `[${index}]`, level + 1)}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div style={{ marginLeft: `${indent}px` }} className="border-l border-blue-500/20 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                Object
              </Badge>
              <span className="text-blue-300 font-medium">{key}</span>
            </div>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="mb-2">
                {renderJsonValue(subValue, subKey, level + 1)}
              </div>
            ))}
          </div>
        );
      }
    } else {
      const valueType = typeof value;
      const colorMap = {
        string: 'text-green-300',
        number: 'text-amber-300',
        boolean: 'text-purple-300',
        null: 'text-gray-400'
      };

      return (
        <div style={{ marginLeft: `${indent}px` }} className="group">
          <div className="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-2 -mx-2">
            <span className="text-blue-300 font-medium min-w-0 flex-shrink-0">{key}:</span>
            <span className={`${colorMap[valueType]} font-mono text-sm truncate`}>
              {valueType === 'string' ? `"${value}"` : String(value)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 p-1 h-6 w-6"
              onClick={() => handleCopyKey(key, value)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Braces className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Generated JSON</span>
          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
            {lineCount} lines
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300"
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="text-blue-400 hover:text-blue-300"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="text-blue-400 hover:text-blue-300"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {renderJsonValue(json)}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4"
          >
            <pre className="text-xs text-green-300 font-mono overflow-x-auto">
              {jsonString.split('\n').slice(0, 5).join('\n')}
              {lineCount > 5 && '\n...'}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 