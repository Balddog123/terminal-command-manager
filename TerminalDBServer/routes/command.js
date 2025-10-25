import express from "express";
import fs from "fs/promises"; // use promise-based fs
import path from "path";
import {v4 as uuidv4} from "uuid";

const router = express.Router();
const DATA_PATH = path.resolve("commands-data.json");

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

// Read commands
async function getCommands() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    throw err;
  }
}

// Write commands
async function saveCommands(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing JSON file:", err);
    throw err;
  }
}

// GET route: return all commands
router.get("/", async (req, res) => {
  try {
    const commands = await getCommands();
    res.status(200).json(commands);
  } catch (error) {
    res.status(500).json({ message: "Error reading commands", error });
  }
});

// GET single command
router.get("/:id", async (req, res) => {
  try {
    const commands = await getCommands();
    const command = commands.find((cmd) => cmd.id === req.params.id);

    if(!command){
        return res.status(404).json({message: `Command with id ${req.params.id} not found`});
    }

    res.status(200).json(command);
  } catch (error) {
    res.status(500).json({ message: "Error reading single command", error });
  }
});

// POST route: add a new command
router.post("/", async (req, res) => {
  try {
    console.log(`Attempting to add new command:`);
    console.log(req.body);
    const commands = await getCommands();
    console.log(`Attempting to get commands:`);
    console.log(commands);
    // object -> array
    console.log(`Attempting to convert json to array:`);
    const commandsToArray = objectToArray(commands);    
    console.log(commandsToArray);
    console.log(`Attempting to push new command to array:`);
    commandsToArray.push(req.body);
    console.log(commandsToArray);
    console.log('Attempting to convert array to single object');
    const newCommands = arrayToObject(commandsToArray);
    console.log(newCommands);
    console.log(`Attempting to save commands:`);
    await saveCommands(newCommands);
    console.log(commands);
    res.status(201).json({ message: "Command added"});
  } catch (error) {
    res.status(500).json({ message: "Error saving command", error });
  }
});

//PUT: update single command
router.put("/updateone/:id", async (req, res) => {
  console.log(`Attempting to update command ${req.params.id}...`);
    try{
      const commands = await getCommands();

      const index = commands.findIndex((cmd) => cmd.id === req.params.id);

      if (index === -1){
        return res.status(404).json({message: `Command with id ${req.params.id} not found`});
      }

      commands[index] = {...commands[index], ...req.body};
      await saveCommands(commands);

      res.status(200).json({message: "Command updated", command: commands[index]});
    }catch(error){
      console.log("500 Error...");
        res.status(500).json({message: "Error updating command", error});
    }
});

router.put("/updateall", async(req, res) => {
  console.log("Attempting to update all commands");
  try{
    await saveCommands(req.body);
    res.status(200).json({message: "All commands updated"});
  }catch(error){
    res.status(500).json({message: "Error updating all commands", error});
    }
});

//DELETE
router.delete("/:key", async(req, res) => {
  console.log(`Attempting to delete command ${req.params.key}...`);
    try{
        const commands = await getCommands();
        const updated = commands.filter(cmd => Object.keys(cmd)[0] === req.params.key);

        if(updated.length === commands.length){
            return res.status(404).json({message: `Command with id ${req.params.key} not found`});
        }

        await saveCommands(updated);
        res.status(200).json({message: "Command deleted"});
    }catch(error){
        res.status(500).json({message: "Error deleting command", error});
    }
});

export default router;