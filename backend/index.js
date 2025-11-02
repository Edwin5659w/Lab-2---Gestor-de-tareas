const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let tasks = [];
let nextId = 1;

// Rutas para gestión de tareas (CRUD + resumen)
const VALID_STATUSES = new Set(["todo", "doing", "done"]);

app.get("/", (req, res) => {
  res.send("Hello World desde Express!");
});

// GET /tasks?status=...
app.get("/tasks", (req, res) => {
  const { status } = req.query;
  if (status) {
    if (!VALID_STATUSES.has(status)) return res.status(400).json({ message: "status inválido" });
    return res.json((tasks || []).filter(t => t.status === status));
  }
  res.json(tasks || []);
});

// GET /tasks/summary (DEBE IR PRIMERO)
app.get("/tasks/summary", (req, res) => {
  const summary = { todo: 0, doing: 0, done: 0 };
  (tasks || []).forEach(t => {
    if (VALID_STATUSES.has(t.status)) summary[t.status] = (summary[t.status] || 0) + 1;
  });
  res.json(summary);
});

// GET /tasks/:id (VA DESPUÉS)
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = (tasks || []).find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ message: "title es requerido" });
  const list = tasks || [];
  const newId = list.length ? Math.max(...list.map(t => t.id)) + 1 : 1;
  const newTask = { id: newId, title, description: description || "", status: "todo" };
  list.push(newTask);
  // if tasks was undefined, attach back
  if (!tasks) tasks = list;
  res.status(201).json(newTask);
});

// PUT /tasks/:id  (reemplaza todos los campos)
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, description, status } = req.body || {};
  if (!title) return res.status(400).json({ message: "title es requerido" });
  if (!status || !VALID_STATUSES.has(status)) return res.status(400).json({ message: "status inválido" });
  const idx = (tasks || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: "Task not found" });
  const updated = { id, title, description: description || "", status };
  tasks[idx] = updated;
  res.json(updated);
});

// PATCH /tasks/:id/status  (cambia solo el estado)
app.patch("/tasks/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!status || !VALID_STATUSES.has(status)) return res.status(400).json({ message: "status inválido" });
  const task = (tasks || []).find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  task.status = status;
  res.json({ id: task.id, status: task.status });
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = (tasks || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: "Task not found" });
  tasks.splice(idx, 1);
  res.json({ message: "Task deleted successfully" });
});

// Nuevo endpoint: cita motivacional aleatoria
app.get("/quotes/random", async (req, res) => {
  try {
    const resp = await axios.get("https://api.quotable.io/random?tags=motivational");
    const { content, author } = resp.data || {};
    if (!content) return res.status(502).json({ message: "No se obtuvo cita de la API externa" });
    res.json({ quote: content, author });
  } catch (err) {
    res.status(502).json({ message: "Error al obtener cita externa", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});