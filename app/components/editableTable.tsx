'use client';

import { useState } from 'react';
import DataGrid from 'react-data-grid';

// 初期データ
const defaultRows = [
  { id: 1, title: "行1", count: 20 },
  { id: 2, title: "行2", count: 40 },
  { id: 3, title: "行3", count: 60 }
];

// カラム定義
const columns = [
  { key: 'id', name: 'ID', editable: false },
  { key: 'title', name: 'タイトル', editable: true },
  { key: 'count', name: '数量', editable: true }
];

export default function EditableTable() {
  const [rows, setRows] = useState(defaultRows);

  // セルの編集後に行データを更新
  const onRowsChange = (newRows: typeof defaultRows) => {
    setRows(newRows);
  };

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
    />
  );
}
