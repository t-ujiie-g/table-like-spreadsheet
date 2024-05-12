'use client';

import { useState } from 'react';

// 初期データ
const defaultRows = [
  { id: 1, title: "行1", count: 20 },
  { id: 2, title: "行2", count: 40 },
  { id: 3, title: "行3", count: 60 }
];

interface handleCellChangeInput {
  id: number;
  column: string;
  value: string;
}

export default function EditableTable() {
  const [rows, setRows] = useState(defaultRows);

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
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rowsData = clipboardData.split('\n').map(row => row.split('\t'));

    // ここで rowsData を解析し、適切なセルにデータを挿入するロジックを追加
    // 例: 最初のセルから順にデータを挿入
    const newRows = [...rows];
    let startRow = 0; // 選択された行の開始位置（実際の実装では動的に決定する必要がある）
    rowsData.forEach((rowData, i) => {
      const targetRow = newRows[startRow + i];
      if (targetRow) {
        rowData.forEach((cellData, j) => {
          if (j === 0) targetRow.title = cellData;
          if (j === 1) targetRow.count = parseInt(cellData, 10) || targetRow.count;
        });
      }
    });
    setRows(newRows);
  };

  return (
    <div className="p-4">
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">タイトル</th>
            <th className="px-4 py-2">数量</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">{row.id}</td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => handleCellChange({ id: row.id, column: 'title', value: e.target.value })}
                  onPaste={handlePaste}
                  className="w-full bg-transparent border-none p-1"
                  onFocus={(e) => e.target.select()}
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={row.count}
                  onChange={(e) => handleCellChange({ id: row.id, column: 'count', value: e.target.value })}
                  onPaste={handlePaste}
                  className="w-full bg-transparent border-none p-1"
                  onFocus={(e) => e.target.select()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
