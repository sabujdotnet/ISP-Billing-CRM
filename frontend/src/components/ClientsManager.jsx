const handleDelete = (id) => {
  setConfirmDialog({ id, open: true });
};

// In table
<td className="px-4 py-3">
  <div className="flex gap-2">
    <button onClick={() => handleEdit(client)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
      <Edit className="w-4 h-4" />
    </button>
    <button onClick={() => handleDelete(client.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</td>

// At the bottom of the component
{confirmDialog.open && (
  <ConfirmDialog
    onConfirm={async () => {
      await API.deleteClient(confirmDialog.id);
      await loadData();
    }}
    onCancel={() => setConfirmDialog({ id: null, open: false })}
    message="Are you sure you want to delete this client?"
  />
)}
