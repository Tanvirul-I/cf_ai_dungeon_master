# Prompts Used to Build This Project

A log of the AI prompts used during development of the AI Dungeon Master, why each was chosen, and what it produced.

---

## How to Read This Document

Each entry follows this format:

- **Prompt** — The exact (or paraphrased) prompt given to the AI assistant.
- **Why** — The reasoning behind this prompt or what problem it was solving.
- **Result** — What the prompt produced, files changed, and any follow-up needed.

---

## 1. Initial Cloudflare Code

**Prompt:**
> Create a basic outline for a cloudflare worker that can run a text based RPG game. It should have an init endpoint to start a new game and a turn endpoint to continue the game. The expectation is that it will use an LLM, preferably Llama 3.3 on Workers AI, workflow/coordination via Durable Objects, user input via a chat interface and storage through memory or state. The game should be able to run in a browser. Break down the code and explain why you made each decision.

**Why:**
_This prompt was chosen to get a basic outline of a cloudflare worker that can run a text based RPG game. It was chosen because it is a good starting point for the project and it is a good way to get a basic outline of the code._

**Result:**
_Generated the boilerplate code for the cloudflare worker. It was a good starting point for the project and it is a good way to get a basic outline of the code. I also got a good understanding of how to use Durable Objects and how to use the Workers AI API._

---

## 2. Understanding the wrangler.jsonc File

**Prompt:**
> Explain the wrangler.jsonc file and how it is used to configure the cloudflare worker. Break down the code and explain why each decision was made.

**Why:**
_This prompt was chosen to get a basic understanding of the wrangler.jsonc file and how it is used to configure the cloudflare worker._

**Result:**
_Generated information about the wrangler.jsonc file and how it is used to configure the cloudflare worker._

---

## 3. Create the Frontend

**Prompt:**
> Create the frontend for the cloudflare worker. It should be a simple chat interface that allows the user to interact with the game. Let the user know when their input is being processed and when the game is loading. Also, create a button to start a new game. Break down the code and explain why you made each decision.

**Why:**
_This prompt was chosen to create the frontend for the cloudflare worker. It was chosen because it is a good starting point for the project and it is a good way to get a basic outline of the code._

**Result:**
_Generated the frontend for the cloudflare worker._

---

> **Note:** There were other prompts made throughout development for minor bug fixes, updates, and small adjustments that are not documented here. These are all the major changes made by AI to the code.