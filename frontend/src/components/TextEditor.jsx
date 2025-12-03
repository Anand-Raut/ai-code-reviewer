import { useState, useRef, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'

const TextEditor = () => {
  const [code, setCode] = useState("")
  const [stats, setStats] = useState({})

  const prevCodeRef = useRef("")
  const lastEditTimeRef = useRef(null)
  const activeLinesRef = useRef(new Set())

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

  const handleEditorChange = (value) => {
    if (!value) return

    const now = Date.now()
    const oldCode = prevCodeRef.current
    const newCode = value
    const newLines = newCode.split("\n")
    const oldLines = oldCode.split("\n")
    let newStats = { ...stats }

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
      if (activeLinesRef.current.size > 0) {
        activeLinesRef.current.forEach((lineNumber) => {
          if (!newStats[lineNumber]) {
            newStats[lineNumber] = {
              time_spent: 0,
              edit_count: 0,
              content: newLines[lineNumber - 1]
            }
          }

          newStats[lineNumber].time_spent += now - lastEditTimeRef.current;
        });
      }
      const timeDelta = now - lastEditTimeRef.current
      activeLinesRef.current = editedLines(oldLines, newLines)

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

    setStats(newStats)
    prevCodeRef.current = value
    setCode(value)
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
      />

      <pre style={{ color: "white", background: "#222", padding: 10 }}>
        {JSON.stringify(stats, null, 2)}
      </pre>
    </div>
  )
}

export default TextEditor
