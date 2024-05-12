import EditableTable from "./components/editableTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <EditableTable />
      </div>
    </div>
  );
}
