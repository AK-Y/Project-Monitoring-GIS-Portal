import { useSelector } from "react-redux";

const ProjectTable = () => {
  const projects = useSelector(state => state.projects.list);
  const assetId = useSelector(state => state.assets.selectedAssetId);

  if (!assetId) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-slate-500">
          Select a road on map to view projects
        </p>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-slate-500">No projects found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-left">Project</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-4 font-medium">{p.name_of_work}</td>
              <td>{p.status}</td>
              <td>₹ {p.budget_during_year}</td>
              <td>{p.physical_progress_percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;

