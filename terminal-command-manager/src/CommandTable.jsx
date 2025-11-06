import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {arrayToObject, objectToArray, addEmptyCommand, deleteCommand, fetchCommands, updateAllCommands} from "./CommandsHelpers"


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
  const [error, setError] = useState(null);
  const [activeCommand, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  //setError(err.message);
  //setCommands(commandsArray); 

  useEffect(() => {
    // Wait for DOM to render all textareas, then resize each one
    adjustTextAreaSize();
  }, [commands, matches]);


  useEffect(() => {
    async function getCommands() {
      const fetchedCommands = await fetchCommands();
      if(fetchedCommands === null) setError("Failed to fetch!");
      else { 
        // assuming your JSON is stored in a variable named "commands"
        setCommands(fetchedCommands);
      }
    }
    getCommands();

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
        <button type="button" onClick={handleAdd}>
          Add New Command
        </button>
      </div>
    <table className="command-table">
      <colgroup>
        <col style={{ width: "90px" }} />
        <col style={{ width: "200px" }} />
        <col style={{ width: "70px" }} />
        <col style={{ width: "300px" }} />
        <col style={{ width: "90px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "80px" }} />
      </colgroup>
      <thead>
        <tr>          
          <th>Actions</th>
          <th>Terminal Command</th>
          <th>Terminal</th>
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
        </tr>
      </thead>
      <tbody>
        {commands.filter(cmd=>matches.includes(Object.keys(cmd)[0])).map((cmd, index) => {
          const key = Object.keys(cmd)[0];
          const data = cmd[key];

          return (
          <tr key={index}>
            <td>
              <Link to={`/command/${key}`} state={{key: key, commandData: data}} style={{padding: "5px"}}>Edit</Link>
              <button onClick={() => handleDelete(key)}>Delete</button>
            </td>
            <td>{key}</td>
            <td name="terminal number">{data.terminal_num}</td>
            <td name="text">{data.text}</td>
            <td name="require act">{data.require_act}</td>
            <td name="video">{data.video}</td>
            <td name="media scale">{data.media_scale}</td>
            <td name="image">{data.image}</td>
            <td name="audio">{data.audio}</td>
            <td name="url">{data.url}</td>
            <td name="html">{data.html}</td>            
            <td name="debug only">{data.debug_only ? "✅" : "❌"}</td>
            {/*<td name="set session data"><textarea className="table-textarea" rows={1} type="text" value={data.set_session_data} onChange={(e)=> {
              handleInputChange(key, "set_session_data", e.target.value);
            }}/></td>
            */}
            
          </tr>
        )
        })}
      </tbody>
    </table>    
    </div>
    
  );
}

export default CommandTable;
