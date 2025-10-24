import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5050/command";
//POST
async function addEmptyCommand()
{
  const defaultCommand = {
    name: "command_name",
    terminalNum: 1,
    description: "displaying description of the terminal command..."
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(defaultCommand)
  });

  if(!res.ok) throw new Error("Failed to add command");
  return await res.json();
};
//GET single
/*
function getCommand(id){
  const response = fetch(`${API_URL}/${id}`);
  if(!response.ok) throw new Error("Command not found");
  console.log(response.json());
}*/
//PUT
async function updateCommand(id, updates){
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updates),
  });
  if(!res.ok) throw new Error("Failed to update command");
  return await res.json();
};
//DELETE
async function deleteCommand(id){
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  if(!res.ok) throw new Error("Failed to delete command");
  return await res.json();
};
  
function CommandTable() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all
  async function fetchCommands() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch commands");
      const data = await res.json();
      setCommands(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    // Wait for DOM to render all textareas, then resize each one
    const textareas = document.querySelectorAll(".table-textarea");
    textareas.forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    });
  }, [commands]);


  useEffect(() => {
    fetchCommands();
  }, []);

  // Event handlers
  const handleAdd = async () => {
    await addEmptyCommand();
    fetchCommands();
  };

  const handleDelete = async (id) => {
    await deleteCommand(id);
    fetchCommands();
  };

  const handleInputChange = (id, field, value) =>{
    setCommands((prevCommands) => 
      prevCommands.map((cmd) =>
        cmd.id === id ? { ...cmd, [field]: value} : cmd
      )
    );    
  };

  const handleUpdate = async (id, cmd) => {
    await updateCommand(id, { ...cmd});
    fetchCommands();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
    <table className="command-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {commands.map((cmd) => (
          <tr key={cmd.id}>
            <td><textarea className="table-textarea" rows={1} type="text" value={cmd.name} onChange={(e)=> {
              handleInputChange(cmd.id, "name", e.target.value);
            }} onBlur={() => handleUpdate(cmd.id, cmd)}/></td>
            <td><textarea className="table-textarea" rows={1} type="text" value={cmd.description} onChange={(e)=> {
              handleInputChange(cmd.id, "description", e.target.value);
            }} onBlur={() => handleUpdate(cmd.id, cmd)}/></td>
            <td>
              <button onClick={() => handleDelete(cmd.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button type="button" onClick={handleAdd}>
      Add New Command
    </button>
    </div>
    
  );
}

export default CommandTable;
