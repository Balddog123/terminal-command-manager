
const API_URL = "http://localhost:5050/command";

// array -> object
export const arrayToObject = (arr) =>
  arr.reduce((acc, cmd) => {
    const key = Object.keys(cmd)[0];
    acc[key] = cmd[key];
    return acc;
  }, {});

// object -> array
export const objectToArray = (obj) =>
  Object.keys(obj).map(key => ({ [key]: obj[key] }));

//POST
export async function addEmptyCommand()
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
export async function updateCommand(id, updates){
  const res = await fetch(`${API_URL}/updateone/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updates),
  });
  if(!res.ok) throw new Error("Failed to update command");
  return await res.json();
};
export async function updateAllCommands(updates){
  //converts array to single object for json
  //ideally we wouldn't need this but I'm trying not to break the system fierce already built
  const updatesObject = arrayToObject(updates);

  const res = await fetch(`${API_URL}/updateall`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updatesObject),
  });
  console.log(res);
  if(!res.ok) throw new Error("Failed to update all commands");
  return await res.json();
};
//DELETE
export async function deleteCommand(key){
  const res = await fetch(`${API_URL}/${key}`, {
    method: "DELETE"
  });
  if(!res.ok) throw new Error("Failed to delete command");
  return await res.json();
};

//GET
// Fetch all
export async function fetchCommands() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch commands");
    const data = await res.json();
    //convert to array since data is single object in a json
    const commandsArray = objectToArray(data);
    return commandsArray;     
  } catch (err) {
    return null;
  }
};