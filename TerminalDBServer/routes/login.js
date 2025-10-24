import express from "express";

const router = express.Router();

const master_pword = "heusta"

// check password
router.get("/:password", async (req, res) => {
  console.log("Someone is attempting to sign in");
  try {
    if(req.params.password != master_pword){
        return res.status(404).json({message: `Password ${req.params.password} not found`});
    }

    return res.status(202).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error reading password", error });
  }
});

export default router;