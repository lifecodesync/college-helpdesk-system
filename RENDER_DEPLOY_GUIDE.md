# Hosting AI College Helpdesk on Render (Step-by-Step Guide)

You can host both the **FastAPI Backend** and the **React Frontend** on [Render.com](https://render.com) for free with automated HTTPS and global CDN.

---

## Method 1: Automatic 1-Click Deployment (Using GitHub + Blueprint)

Render includes a `render.yaml` blueprint file in this project that configures both the backend and frontend automatically.

### Step 1: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com) (e.g. `college-helpdesk-system`).
2. Open terminal in the project folder and push:
   ```bash
   git init
   git add .
   git commit -m "Deploy AI College Helpdesk to Render"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/college-helpdesk-system.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository `college-helpdesk-system`.
4. Render will read `render.yaml` and show:
   - `college-helpdesk-backend` (Web Service - Python)
   - `college-helpdesk-frontend` (Static Site - React)
5. Click **Apply**.
6. Render will automatically build and deploy both services!

---

## Method 2: Manual Setup on Render (Without Blueprint)

If you prefer to configure each service manually on the Render dashboard:

### Part A: Deploy the Backend (Python FastAPI)

1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Configure the fields:
   - **Name:** `college-helpdesk-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
4. In **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9`
   - `JWT_SECRET_KEY`: any random string (e.g. `supersecretkey123`)
   - *(Optional)* `GEMINI_API_KEY`: your Google Gemini API key if using cloud AI
   - *(Optional)* `SUPABASE_URL` and `SUPABASE_KEY`: if using live Supabase cloud
5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://college-helpdesk-backend.onrender.com`).

---

### Part B: Deploy the Frontend (React Vite)

1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **Static Site**.
2. Connect the same GitHub repository.
3. Configure the fields:
   - **Name:** `college-helpdesk-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://college-helpdesk-backend.onrender.com/api/v1` *(replace with your actual backend URL from Part A)*
5. Configure **Redirects / Rewrites** (Important for React Router):
   - Scroll to **Redirects / Rewrites**
   - Click **Add Rule**
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **Deploy Static Site**.

---

## How to Test After Deployment

1. Open your frontend Render URL:
   `https://college-helpdesk-frontend.onrender.com`
2. You will be greeted by the **Official College Login Screen**.
3. Click:
   - `Sign In as Student` → Aarav Mehta's dashboard (attendance 82.5%, CGPA 8.64, grievances)
   - `Sign In as Faculty` → Prof. Priya Verma's queue and department circulars
   - `Sign In as Admin` → Dr. Ramesh Sharma's executive command center
4. Ask a question to the AI bot:
   *"What is the minimum attendance requirement for semester exams?"*
   → Returns grounded answer with citations (`Academic Regulations 2026.pdf, Page 1`).
5. Share the live Render link with your evaluators, team members, or over WhatsApp!
