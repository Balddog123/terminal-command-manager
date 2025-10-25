import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5050/command";

//helper
// array -> object
const arrayToObject = (arr) =>
  arr.reduce((acc, cmd) => {
    const key = Object.keys(cmd)[0];
    acc[key] = cmd[key];
    return acc;
  }, {});

// object -> array
const objectToArray = (obj) =>
  Object.keys(obj).map(key => ({ [key]: obj[key] }));


//POST
async function addEmptyCommand()
{
  const defaultCommand = {
    "command_name" : {
      terminal_num: 1,
      text: "displaying description of the terminal command..."
    }    
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(defaultCommand)
  });

  if(!res.ok) throw new Error("Failed to add command");
  return await res.json();
};
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
async function updateAllCommands(updates){
  //converts array to single object for json
  //ideally we wouldn't need this but I'm trying not to break the system fierce already built
  const updatesObject = arrayToObject(updates);

  const res = await fetch(`${API_URL}/updateall`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updatesObject),
  });
  if(!res.ok) throw new Error("Failed to update all commands");
  return await res.json();
};
//DELETE
async function deleteCommand(key){
  const res = await fetch(`${API_URL}/${key}`, {
    method: "DELETE"
  });
  if(!res.ok) throw new Error("Failed to delete command");
  return await res.json();
};

function adjustTextAreaSize(){
  const textareas = document.querySelectorAll(".table-textarea");
  textareas.forEach((ta) => {
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  });
}
  
//MAIN
function CommandTable() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCommand, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch all
  async function fetchCommands() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch commands");
      const data = await res.json();
      //convert to array since data is single object in a json
      const commandsArray = objectToArray(data);
      setCommands(commandsArray);
      setLoading(false);

      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for DOM to render all textareas, then resize each one
    adjustTextAreaSize();
  }, [commands, matches]);


  useEffect(() => {
    fetchCommands();
    const handleClickOutside = (e) => {
      if(!e.target.closest(".autocomplete-container")){
        setDropdownVisible(false);
      }      
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const commandNames = commands.map(cmd => Object.keys(cmd)[0]);
    const filtered = commandNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    setMatches(filtered);
    //setDropdownVisible(filtered.length > 0);
  }, [search, commands]);

  // Event handlers
  const handleAdd = async () => {
    let dupFound = false;
    for(const cmd in commands){
      const cmdKey = Object.keys(commands[cmd])[0];
      if(cmdKey === "command_name")
      {
        console.log("Found a duplicate. Will not add new command.");
        dupFound = true;
        break;
      }
    }

    if(!dupFound){
      await addEmptyCommand();
      fetchCommands();
    }
    
  };

  const handleDelete = async (key) => {
    await deleteCommand(key);
    fetchCommands();
  };

  const handleInputChange = (matchKey, field, value) =>{
    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = false;
  
    setCommands((prevCommands) => 
      prevCommands.map((cmd) =>
      {
        const key = Object.keys(cmd)[0];
        const innerData = cmd[key];

        if (key === matchKey) {
          return {
            [key] : {
              ...innerData,
              [field] : value 
            },
          };
        }
        return cmd;
      })
    ); 
  };

  const handleCommandNameChange = (oldKey, newKey) =>{
    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = false;

    setCommands((prevCommands) => 
      prevCommands.map((cmd) =>
      {
        const key = Object.keys(cmd)[0];
        if (key === oldKey) { 
          const value = cmd[key];
          return {[newKey] : value}
        }
        return cmd;
      })
    ); 
  }

  const handleUpdate = async () => {
    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = true;
    
    await updateAllCommands(commands);
    fetchCommands();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div className="autocomplete-container">
        <input id="commandInput" value={search} className="input-search" type="text" placeholder="Type a command name..." onFocus={() => setDropdownVisible(true)} onChange={(e) => setSearch(e.target.value)}></input>
        {dropdownVisible && (
          <div id="commandDropdown" className="dropdown">
            {matches.map((cmd) => (
              <div key={cmd} onClick={() => {
                setSearch(cmd);
                const selected = commands.find(c => Object.keys(c)[0] === cmd);
                setActive(selected || null);
                console.log(`Active command: ${cmd}`);
                setDropdownVisible(false);
              }}>
                {cmd}
              </div>
            ))}
          </div>
        )}
      </div>
    <table className="command-table">
      <thead>
        <tr>
          <th>Terminal Command</th>
          <th>Terminal Type</th>
          <th>Response Text</th>
          <th>Require Act</th>
          <th>Video</th>
          <th>Media Scale</th>
          <th>Image</th>
          <th>Audio</th>
          <th>URL</th>
          <th>HTML</th>
          <th>Debug Only</th>
          {//<th>Set Session Data</th>
          }
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {commands.filter(cmd=>matches.includes(Object.keys(cmd)[0])).map((cmd, index) => {
          const key = Object.keys(cmd)[0];
          const data = cmd[key];

          return (
          <tr key={index}>
            <td><textarea className="table-textarea" rows={1} type="text" value={key} onChange={(e)=> {
              handleCommandNameChange(key, e.target.value);
            }}/></td>
            <td name="terminal number">
              <select id={"terminal_num-"+key} value={data.terminal_num} onChange={(e)=> {handleInputChange(key, "terminal_num", parseInt(e.target.value, 10))}}>
                <option value={0}>First</option>
                <option value={1}>PixelDMN</option>
              </select>
            </td>
            <td name="text"><textarea className="table-textarea" rows={1} type="text" value={data.text} onChange={(e)=> {
              handleInputChange(key, "text", e.target.value);
            }}/></td>
            <td name="require act">
              <input
                type="number"
                className="table-input"
                value={data.require_act ?? ""} 
                onChange={(e) => {
                  handleInputChange(key, "require_act", Number(e.target.value));
                }}
              />
            </td>
            <td name="video"><textarea className="table-textarea" rows={1} type="text" value={data.video} onChange={(e)=> {
              handleInputChange(key, "video", e.target.value);
            }}/></td>
            <td name="media scale"><textarea className="table-textarea" rows={1} type="text" value={data.media_scale} onChange={(e)=> {
              handleInputChange(key, "media_scale", parseFloat(e.target.value, 10.00));
            }}/></td>
            <td name="image"><textarea className="table-textarea" rows={1} type="text" value={data.image} onChange={(e)=> {
              handleInputChange(key, "image", e.target.value);
            }}/></td>
            <td name="audio"><textarea className="table-textarea" rows={1} type="text" value={data.audio} onChange={(e)=> {
              handleInputChange(key, "audio", e.target.value);
            }}/></td>
            <td name="url"><textarea className="table-textarea" rows={1} type="text" value={data.url} onChange={(e)=> {
              handleInputChange(key, "url", e.target.value);
            }}/></td>
            <td name="html"><textarea className="table-textarea" rows={1} type="text" value={data.html} onChange={(e)=> {
              handleInputChange(key, "html", e.target.value);
            }}/></td>
            
            <td name="debug only">
              <select id={"debug_only-"+key} value={data.debug_only} onChange={(e)=> {handleInputChange(key, "debug_only", e.target.value === true)}}>
                <option value={false}>False</option>
                <option value={true}>True</option>
              </select></td>
            {/*<td name="set session data"><textarea className="table-textarea" rows={1} type="text" value={data.set_session_data} onChange={(e)=> {
              handleInputChange(key, "set_session_data", e.target.value);
            }}/></td>
            */}
            <td>
              <button onClick={() => handleDelete(key)}>Delete</button>
            </td>
          </tr>
        )
        })}
      </tbody>
    </table>
    <button id="saveButton" type="button" onClick={handleUpdate}>Save Changes</button>
    <button type="button" onClick={handleAdd}>
      Add New Command
    </button>
    </div>
    
  );
}

export default CommandTable;
