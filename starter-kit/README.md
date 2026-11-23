# Northpine Basecamp: starter kit

This is where you start the AI-103 course. The shop website already works. In each module you add one Python file, and one more feature of the shop opens.

## What you need

- Python 3.10 or newer
- Git and VS Code
- Azure CLI (from Module 01)

## Start in 5 steps (Windows PowerShell)

Open a terminal in the `starter-kit` folder. Run one command at a time.

**1. Create a virtual environment.** It is a private box for this project's Python packages, so they do not mix with other projects.

```powershell
python -m venv .venv
```

**2. Turn it on.** Your prompt now starts with `(.venv)`. Do this every time you open a new terminal.

```powershell
.venv\Scripts\Activate.ps1
```

**3. Install the packages** that the app needs. They are listed in `requirements.txt`.

```powershell
pip install -r requirements.txt
```

**4. Create your settings file.** `.env` holds your own settings. It stays on your PC and is never uploaded to GitHub. You fill it in from Module 03.

```powershell
Copy-Item .env.example .env
```

**5. Check and start the shop.**

```powershell
pytest
uvicorn app.main:app --reload --port 8000
```

`pytest` should say `8 passed`. Then open <http://localhost:8000> in your browser. Press `Ctrl+C` in the terminal to stop the app.

On macOS or Linux, use `source .venv/bin/activate` in step 2 and `cp .env.example .env` in step 4.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| `python` is not recognized | Install Python 3.10 or newer from python.org and tick "Add python.exe to PATH". Open a new terminal |
| "running scripts is disabled on this system" in step 2 | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, answer `Y`, then try step 2 again |
| `No module named 'fastapi'` | The virtual environment is off. Run step 2 again, then step 3 |
| "address already in use" in step 5 | Another program uses port 8000. Use `--port 8001` and open <http://localhost:8001> |
| The shop page says it cannot reach its backend | The app is not running. Run the `uvicorn` command from step 5 |

## What is in this folder

| Path | What it is |
| --- | --- |
| `app/main.py` | Starts the web app |
| `app/routers/` | One Python file per feature. **This is where you work in the course** |
| `app/features.py` | The list of features and the module that opens each one |
| `app/data.py`, `app/config.py` | Load the shop data and the settings |
| `web/` | The shop website. It is finished. You do not need to edit it |
| `data/` | Fictional products, orders, manuals, reviews and receipts. See `data/README.md` |
| `tests/` | One test file per module |
| `.env.example` | Copy it to `.env` in Module 03 |

## How a feature opens

1. You create a new file in `app/routers/`, for example `chat.py` in Module 03.
2. The file has a `router` and a line such as `FEATURES = ["chat"]`.
3. The app finds the file when it starts. The website shows the feature as open.

Open the **Course map** page in the shop to see which features are open.

## Safety notes

- Never commit your `.env` file. It is listed in `.gitignore`.
- The course uses keyless sign-in with `az login`. You never need to paste an API key.
- The order API has no sign-in. It is for training only.
