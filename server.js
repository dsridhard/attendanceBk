const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, "data.json");

app.use(express.static("public"));
app.use(bodyParser.json());

// Fetch leave data
app.get("/api/leaves", (req, res) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });
    res.json(JSON.parse(data));
  });
});

// Add new leave data
app.post("/api/leaves", (req, res) => {
  const newLeave = req.body;

  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const leaves = JSON.parse(data);
    newLeave.id = leaves.length ? leaves[leaves.length - 1].id + 1 : 1; // Unique ID
    leaves.push(newLeave);

    fs.writeFile(dataFilePath, JSON.stringify(leaves, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error saving data" });
      res.json(newLeave);
    });
  });
});

// Update leave data
app.put("/api/leaves/:id", (req, res) => {
  const leaveId = parseInt(req.params.id);
  const updatedData = req.body;

  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const leaves = JSON.parse(data);
    const index = leaves.findIndex((leave) => leave.id === leaveId);

    if (index !== -1) {
      leaves[index] = { ...leaves[index], ...updatedData };

      fs.writeFile(dataFilePath, JSON.stringify(leaves, null, 2), (err) => {
        if (err)
          return res.status(500).json({ message: "Error updating data" });
        res.json(leaves[index]);
      });
    } else {
      res.status(404).json({ message: "Leave not found" });
    }
  });
});

// Delete leave data by ID
app.delete("/api/leaves/:id", (req, res) => {
  const leaveId = parseInt(req.params.id);

  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    let leaves = JSON.parse(data);
    const index = leaves.findIndex((leave) => leave.id === leaveId);

    if (index !== -1) {
      leaves.splice(index, 1); // Remove the leave with the specified ID

      fs.writeFile(dataFilePath, JSON.stringify(leaves, null, 2), (err) => {
        if (err)
          return res.status(500).json({ message: "Error deleting data" });
        res.json({ message: "Leave deleted successfully" });
      });
    } else {
      res.status(404).json({ message: "Leave not found" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
