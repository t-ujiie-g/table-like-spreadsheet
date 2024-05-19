'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// 初期データ
const defaultRows = [
  { id: 1, title: "行1", count: 20, date: '2024-05-14' },
  { id: 2, title: "行2", count: 40, date: '2024-05-15' },
  { id: 3, title: "行3", count: 60, date: '2024-05-16' },
  { id: 4, title: "行4", count: 80, date: '2024-05-17' },
  { id: 5, title: "行5", count: 100, date: '2024-05-18' }
];

interface handleCellChangeInput {
  id: number;
  column: string;
  value: string;
}

export default function EditableTable() {
  const [rows, setRows] = useState(defaultRows);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [lastSelectedCell, setLastSelectedCell] = useState({ row: 0, column: 0 });
  const [selectionRange, setSelectionRange] = useState({ start: { row: 0, column: 0 }, end: { row: 0, column: 0 } });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [editingCell, setEditingCell] = useState<{ row: number, column: number } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // セルの値を更新する関数
  const handleCellChange = ( props: handleCellChangeInput ) => {
    const newRows = rows.map(row => {
      if (row.id === props.id) {
        return { ...row, [props.column]: props.value };
      }
      return row;
    });
    setRows(newRows);
  };

  // クリップボードからのデータを処理する関数
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rowsData = clipboardData.split('\n').map(row => row.split('\t'));

    const newRows = [...rows];
    rowsData.forEach((rowData, i) => {
      const targetRowIndex = selectedCell.row + i;
      if (targetRowIndex < newRows.length) {
        rowData.forEach((cellData, j) => {
          const targetColumnIndex = selectedCell.column + j;
          if (targetColumnIndex === 0) {
            newRows[targetRowIndex].date = cellData;
          } else if (targetColumnIndex === 1) { // タイトル列
            newRows[targetRowIndex].title = cellData;
          } else if (targetColumnIndex === 2) { // 数量列
            newRows[targetRowIndex].count = parseInt(cellData, 10) || newRows[targetRowIndex].count;
          }
        });
      }
    });
    setRows(newRows);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending' ? 
        <ChevronUpIcon className="w-4 h-4 inline" /> : 
        <ChevronDownIcon className="w-4 h-4 inline" />;
    }
    return null;
  };

  const handleSort = (key: keyof typeof defaultRows[0]) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedRows = [...rows].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setRows(sortedRows);
    setSortConfig({ key, direction });
  };
  
  const handleCellClick = (rowIndex: number, columnIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      setSelectionRange({ ...selectionRange, end: { row: rowIndex, column: columnIndex } });
    } else {
      setSelectedCell({ row: rowIndex, column: columnIndex });
      setLastSelectedCell({ row: rowIndex, column: columnIndex });
      setSelectionRange({ start: { row: rowIndex, column: columnIndex }, end: { row: rowIndex, column: columnIndex } });
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (editingCell) {
      // 編集状態の場合、矢印キーの動作を変更しない
      if (e.key === 'Enter') {
        const { row, column } = editingCell;
        setEditingCell(null);
  
        // 1つ下のセルを選択
        const newRow = Math.min(row + 1, rows.length - 1);
        setSelectedCell({ row: newRow, column });
        setSelectionRange({ start: { row: newRow, column }, end: { row: newRow, column } });
      }
      return;
    }
  
    if (e.shiftKey) {
      const { row, column } = lastSelectedCell;
      let newRow = row;
      let newColumn = column;
    
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault(); // デフォルトのブラウザ動作を防ぐ
        if (e.key === 'ArrowUp') {
          newRow = 0;
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: newRow, column: selectionRange.start.column }, end: { row: selectionRange.end.row, column: selectionRange.end.column } });
        }
        if (e.key === 'ArrowDown') {
          newRow = rows.length - 1;
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: selectionRange.start.row, column: selectionRange.start.column }, end: { row: newRow, column: selectionRange.end.column } });
        }
        if (e.key === 'ArrowLeft') {
          newColumn = 0;
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: selectionRange.start.row, column: newColumn }, end: { row: selectionRange.end.row, column: selectionRange.end.column } });
        }
        if (e.key === 'ArrowRight') {
          newColumn = 2;
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: selectionRange.start.row, column: selectionRange.start.column }, end: { row: selectionRange.end.row, column: newColumn } });
        }
      } else {
        const { row: startRow, column: startColumn } = selectionRange.start;
        const { row: endRow, column: endColumn} = selectionRange.end;
        let newRowStart = newRow;
        let newRowEnd = newRow;
        let newColumnStart = newColumn;
        let newColumnEnd = newColumn;
        if (e.key === 'ArrowUp') {
          newRow = Math.max(row - 1, 0);
          if (lastSelectedCell.row > startRow) {
            newRowStart = startRow;
            newRowEnd = Math.min(newRow, endRow);
          } else {
            newRowStart = Math.min(newRow, startRow);
            newRowEnd = Math.max(newRow, endRow);
          }
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: newRowStart, column: startColumn }, end: { row: newRowEnd, column: endColumn } });
          console.log({ start: { row: newRowStart, column: newColumn }, end: { row: newRowEnd, column: endColumn } });
        }
        if (e.key === 'ArrowDown') {
          newRow = Math.min(row + 1, rows.length - 1);
          newRowEnd = Math.max(newRow, endRow);
          if (lastSelectedCell.row < endRow) {
            newRowStart = Math.max(newRow, startRow);
          } else {
            newRowStart = Math.min(newRow, startRow);
          }
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: newRowStart, column: startColumn }, end: { row: newRowEnd, column: endColumn } });
        }
        if (e.key === 'ArrowLeft') {
          newColumn = Math.max(column - 1, 0);
          if (lastSelectedCell.column > startColumn) {
            newColumnStart = startColumn;
            newColumnEnd = Math.min(newColumn, endColumn);
          } else {
            newColumnStart = Math.min(newColumn, startColumn);
            newColumnEnd = Math.max(newColumn, endColumn);
          }
          setLastSelectedCell({ row: newRow, column: newColumn });
          setSelectionRange({ start: { row: startRow, column: newColumnStart }, end: { row: endRow, column: newColumnEnd } });
        }
        if (e.key === 'ArrowRight') {
            newColumn = Math.min(column + 1, 2);
            newColumnEnd = Math.max(newColumn, endColumn);
            if (lastSelectedCell.column < endColumn) {
              newColumnStart = Math.max(newColumn, startColumn);
            } else {
              newColumnStart = Math.min(newColumn, startColumn);
            }
            setLastSelectedCell({ row: newRow, column: newColumn });
            setSelectionRange({ start: { row: startRow, column: newColumnStart }, end: { row: endRow, column: newColumnEnd } });
        }
      }
    } else if (!e.metaKey && !e.ctrlKey) {
      const { row, column } = selectedCell;
      let newRow = row;
      let newColumn = column;
  
      if (e.key === 'ArrowUp') newRow = Math.max(row - 1, 0);
      if (e.key === 'ArrowDown') newRow = Math.min(row + 1, rows.length - 1);
      if (e.key === 'ArrowLeft') newColumn = Math.max(column - 1, 0);
      if (e.key === 'ArrowRight') newColumn = Math.min(column + 1, 2);
  
      // 選択が変更されたときに編集状態を解除
      if (newRow !== row || newColumn !== column) {
        setEditingCell(null);
      }
  
      setSelectedCell({ row: newRow, column: newColumn });
      setLastSelectedCell({ row: newRow, column: newColumn });
      setSelectionRange({ start: { row: newRow, column: newColumn }, end: { row: newRow, column: newColumn } });
    } else if (e.metaKey || e.ctrlKey) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); // デフォルトのブラウザ動作を防ぐ
        const { row, column } = selectedCell;
        let newRow = row;
        let newColumn = column;
  
        if (e.key === 'ArrowUp') newRow = 0;
        if (e.key === 'ArrowDown') newRow = rows.length - 1;
        if (e.key === 'ArrowLeft') newColumn = 0;
        if (e.key === 'ArrowRight') newColumn = 2;
  
        setSelectedCell({ row: newRow, column: newColumn });
        setLastSelectedCell({ row: newRow, column: newColumn });
        setSelectionRange({ start: { row: newRow, column: newColumn }, end: { row: newRow, column: newColumn } });
      }
    }
  
    if (e.key === 'Enter') {
      setEditingCell(selectedCell);
    }
  };
  
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    const { start, end } = selectionRange;
    const copiedData = rows.slice(start.row, end.row + 1).map(row => {
      const rowData = [];
      for (let i = start.column; i <= end.column; i++) {
        if (i === 0) rowData.push(row.date);
        if (i === 1) rowData.push(row.title);
        if (i === 2) rowData.push(row.count.toString());
      }
      return rowData.join('\t');
    }).join('\n');
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', copiedData);
    }
  };
  
  useEffect(() => {
    const handleNativePaste = (e: ClipboardEvent) => handlePaste(e as unknown as React.ClipboardEvent<HTMLInputElement>);
    const handleNativeCopy = (e: ClipboardEvent) => handleCopy(e as unknown as ClipboardEvent);
  
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleNativeCopy);
    document.addEventListener('paste', handleNativePaste);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleNativeCopy);
      document.removeEventListener('paste', handleNativePaste);
    };
  }, [selectionRange, selectedCell]);

  useEffect(() => {
    if (editingCell) {
      const { row, column } = editingCell;
      inputRefs.current[row][column]?.focus();
    }
  }, [editingCell]);

  return (
    <div className="p-4">
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 cursor-pointer w-1/3" onClick={() => handleSort('date')}>
              日付 <SortIcon columnKey="date" />
            </th>
            <th className="px-4 py-2 cursor-pointer w-1/3" onClick={() => handleSort('title')}>
              タイトル <SortIcon columnKey="title" />
            </th>
            <th className="px-4 py-2 cursor-pointer w-1/3" onClick={() => handleSort('count')}>
              数量 <SortIcon columnKey="count" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id}>
              <td className={`border px-4 py-2 w-1/3 ${selectionRange.start.row <= rowIndex && rowIndex <= selectionRange.end.row && selectionRange.start.column <= 0 && 0 <= selectionRange.end.column ? 'bg-blue-100' : ''} ${selectedCell.row === rowIndex && selectedCell.column === 0 ? 'bg-blue-100' : ''} `}>
                {editingCell?.row === rowIndex && editingCell?.column === 0 ? (
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleCellChange({ id: row.id, column: 'date', value: e.target.value })}
                    onBlur={() => setEditingCell(null)}
                    ref={(el) => {
                      inputRefs.current[rowIndex] = inputRefs.current[rowIndex] || [];
                      inputRefs.current[rowIndex][0] = el;
                    }}
                    className="w-full bg-transparent border-none p-1"
                  />
                ) : (
                  <div onClick={(e) => handleCellClick(rowIndex, 0, e)}>{row.date}</div>
                )}
              </td>
              <td className={`border px-4 py-2 w-1/3 ${selectionRange.start.row <= rowIndex && rowIndex <= selectionRange.end.row && selectionRange.start.column <= 1 && 1 <= selectionRange.end.column ? 'bg-blue-100' : ''} ${selectedCell.row === rowIndex && selectedCell.column === 1 ? 'bg-blue-100' : ''} `}>
                {editingCell?.row === rowIndex && editingCell?.column === 1 ? (
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => handleCellChange({ id: row.id, column: 'title', value: e.target.value })}
                    onBlur={() => setEditingCell(null)}
                    ref={(el) => {
                      inputRefs.current[rowIndex] = inputRefs.current[rowIndex] || [];
                      inputRefs.current[rowIndex][1] = el;
                    }}
                    className="w-full bg-transparent border-none p-1"
                  />
                ) : (
                  <div onClick={(e) => handleCellClick(rowIndex, 1, e)}>{row.title}</div>
                )}
              </td>
              <td className={`border px-4 py-2 w-1/3 ${selectionRange.start.row <= rowIndex && rowIndex <= selectionRange.end.row && selectionRange.start.column <= 2 && 2 <= selectionRange.end.column ? 'bg-blue-100' : ''} ${selectedCell.row === rowIndex && selectedCell.column === 2 ? 'bg-blue-100' : ''} `}>
                {editingCell?.row === rowIndex && editingCell?.column === 2 ? (
                  <input
                    type="number"
                    value={row.count}
                    onChange={(e) => handleCellChange({ id: row.id, column: 'count', value: e.target.value })}
                    onBlur={() => setEditingCell(null)}
                    ref={(el) => {
                      inputRefs.current[rowIndex] = inputRefs.current[rowIndex] || [];
                      inputRefs.current[rowIndex][2] = el;
                    }}
                    className="w-full bg-transparent border-none p-1"
                  />
                ) : (
                  <div onClick={(e) => handleCellClick(rowIndex, 2, e)}>{row.count}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
