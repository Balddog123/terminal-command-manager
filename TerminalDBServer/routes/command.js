import express from "express";
import fs from "fs/promises"; // use promise-based fs
import path from "path";
import {v4 as uuidv4} from "uuid";

const router = express.Router();
const DATA_PATH = path.resolve("commands-data.json");

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
    const commands = await getCommands();
    const newCommand = req.body;

    newCommand.id = uuidv4();

    commands.push(newCommand);
    await saveCommands(commands);

    res.status(201).json({ message: "Command added", command: newCommand });
  } catch (error) {
    res.status(500).json({ message: "Error saving command", error });
  }
});

//PUT: update single command
router.put("/:id", async (req, res) => {
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

//DELETE
router.delete("/:id", async(req, res) => {
  console.log(`Attempting to delete command ${req.params.id}...`);
    try{
        const commands = await getCommands();
        const updated = commands.filter((cmd) => cmd.id !== req.params.id);

        if(updated.length === commands.length){
            return res.status(404).json({message: `Command with id ${req.params.id} not found`});
        }

        await saveCommands(updated);
        res.status(200).json({message: "Command deleted"});
    }catch(error){
        res.status(500).json({message: "Error deleting command", error});
    }
});

export default router;