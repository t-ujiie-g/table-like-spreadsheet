'use client';

import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// 初期データ
const defaultRows = [
  { id: 1, title: "行1", count: 20, date: '2024-05-14' },
  { id: 2, title: "行2", count: 40, date: '2024-05-15' },
  { id: 3, title: "行3", count: 60, date: '2024-05-16' }
];

interface handleCellChangeInput {
  id: number;
  column: string;
  value: string;
}

export default function EditableTable() {
  const [rows, setRows] = useState(defaultRows);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

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

  return (
    <div className="p-4">
      <table className="table-auto w-full text-left">
      <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
              日付 <SortIcon columnKey="date" />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('title')}>
              タイトル <SortIcon columnKey="title" />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('count')}>
              数量 <SortIcon columnKey="count" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleCellChange({ id: row.id, column: 'date', value: e.target.value })}
                  onPaste={handlePaste}
                  className="w-full bg-transparent border-none p-1"
                  onFocus={() => setSelectedCell({ row: rowIndex, column: 0 })}
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => handleCellChange({ id: row.id, column: 'title', value: e.target.value })}
                  onPaste={handlePaste}
                  className="w-full bg-transparent border-none p-1"
                  onFocus={() => setSelectedCell({ row: rowIndex, column: 1 })}
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={row.count}
                  onChange={(e) => handleCellChange({ id: row.id, column: 'count', value: e.target.value })}
                  onPaste={handlePaste}
                  className="w-full bg-transparent border-none p-1"
                  onFocus={() => setSelectedCell({ row: rowIndex, column: 2 })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
