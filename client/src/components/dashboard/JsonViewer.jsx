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
    <div className="border border-white/20 rounded-lg bg-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Braces className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Generated JSON</span>
          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
            {lineCount} lines
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/10"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Expand
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="text-white hover:bg-white/10"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2 text-sm break-words">
                {renderJsonValue(json)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
        <div className="p-4">
          <pre className="text-sm text-gray-300 bg-black/30 p-3 rounded overflow-x-auto max-h-32 overflow-y-auto break-words whitespace-pre-wrap">
            {jsonString.length > 500 ? jsonString.substring(0, 500) + '...' : jsonString}
          </pre>
        </div>
      )}
    </div>
  );
} 