import { useState, useRef, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'


const TextEditor = ({ stats, onStatsChange, code, onCodeChange }) => {

  const prevCodeRef = useRef("")
  const lastActionWasEditRef = useRef(false)
  const lastEditTimeRef = useRef(null)
  const activeLinesRef = useRef(new Set())
  const editorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(null)
  
  
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor; 

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position)
    })
  };

  useEffect(() => {
    console.log(stats, code)
  }, [stats, code])

  const editedLines = (oldLines, newLines) => {

    const edited = new Set()

    const maxlen = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxlen; i++) {
      if ((oldLines[i] || "") !== (newLines[i] || "")) {
        edited.add(i + 1)
      }
    }
    return edited
  }

  const handleBackspace = (oldLines, newLines) => {
    let i = 0;

    // find first mismatch
    while (
      i < oldLines.length &&
      i < newLines.length &&
      oldLines[i] === newLines[i]
    ) {
      i++;
    }

    const deletedIndex = i + 1;
    const deletedLinesCount = oldLines.length - newLines.length;

    return { deletedIndex, deletedLinesCount };
  };

  const handleNewLine = (oldLines, newLines) => {
  if (!cursorPosition){
    return stats
  }
  
  let idx = 0
  const lineDiff = newLines.length - oldLines.length

  for (idx; idx < oldLines.length; idx++) {
    if (oldLines[idx] !== newLines[idx]){
      break
    }
  }

  const shifted = {}
  
  Object.keys(stats).forEach((key) => {
    const lineNum = parseInt(key)
    if (lineNum >= idx + 1) {
      shifted[lineNum + lineDiff] = stats[lineNum]
    } else {
      shifted[lineNum] = stats[lineNum]
    }
  })
  
  for (let i = 0; i < lineDiff; i++) {
    shifted[idx + 1 + i] = {
      time_spent: 0,
      edit_count: 0,
      content: newLines[idx + i]
    }
  }
  
  return shifted  // Return instead of calling onStatsChange
}

  const handleEditorChange = (value) => {

    if (value.trim() === '') {
      onStatsChange({})
      prevCodeRef.current = value
      onCodeChange(value)
      lastEditTimeRef.current = Date.now()
      activeLinesRef.current = new Set()
      return
    }

    const now = Date.now()
    const oldCode = prevCodeRef.current
    const newCode = value
    const newLines = newCode.split("\n")
    const oldLines = oldCode.split("\n")
    let newStats = { ...stats }

    if (oldLines.length < newLines.length) {
      newStats = handleNewLine(oldLines, newLines)
    }


    if (oldLines.length > newLines.length) {
      const { deletedIndex, deletedLinesCount } = handleBackspace(oldLines, newLines)
      for (let i = 0; i < deletedLinesCount; i++) {
        delete newStats[deletedIndex + i]
      }
      const shifted = {}

      Object.keys(newStats).forEach((key) => {
        const lineNum = parseInt(key)

        if (lineNum > deletedIndex + deletedLinesCount - 1) {
          shifted[lineNum - deletedLinesCount] = newStats[lineNum];
        } else {
          shifted[lineNum] = newStats[lineNum];
        }
      })
      newStats = shifted
      Object.keys(newStats).forEach(key => {
        if (parseInt(key) > newLines.length) {
          delete newStats[key]
        }
      });
    }
    if (lastEditTimeRef.current !== null) {
      if (
        lastEditTimeRef.current &&
        lastActionWasEditRef.current &&
        activeLinesRef.current.size > 0
      ) {
        const delta = now - lastEditTimeRef.current;

        // cap insane jumps (tab switch, idle)
        if (delta < 5000) {
          activeLinesRef.current.forEach((lineNumber) => {
            newStats[lineNumber].time_spent += delta;
          });
        }
      }

      const timeDelta = now - lastEditTimeRef.current
      activeLinesRef.current = editedLines(oldLines, newLines)
      lastActionWasEditRef.current = activeLinesRef.current.size > 0

      activeLinesRef.current.forEach((lineNumber) => {
        if (!newStats[lineNumber]) {
          newStats[lineNumber] = {
            time_spent: 0,
            edit_count: 0,
            content: newLines[lineNumber - 1]
          }
        } else {
          if (timeDelta > 2000) {
            newStats[lineNumber] = {
              ...newStats[lineNumber],
              edit_count: newStats[lineNumber].edit_count + 1,
              content: newLines[lineNumber - 1]
            }
            lastEditTimeRef.current = Date.now()
          } else {
            newStats[lineNumber] = {
              ...newStats[lineNumber],
              content: newLines[lineNumber - 1]
            }
          }
        }
      });
    }

    Object.keys(newStats).forEach((key) => {
      const lineNum = parseInt(key);
      if (lineNum > newLines.length) {
        delete newStats[key];
      }
    });

    onStatsChange(newStats)
    prevCodeRef.current = value
    onCodeChange(value)
    lastEditTimeRef.current = now
  }

  return (
    <div>
      <Editor
        height="85vh"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
      />

      <pre style={{ color: "white", background: "#222", padding: 10 }}>
        {JSON.stringify(stats, null, 2)}
      </pre>
    </div>
  )
}

export default TextEditor
